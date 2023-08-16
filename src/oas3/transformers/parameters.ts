import { isPlainObject } from '@stoplight/json';
import type { IBundledHttpService, IComponentNode, Reference } from '@stoplight/types';

import { withContext } from '../../context';
import { isNonNullable } from '../../guards';
import { isReferenceObject, isValidOas3ParameterObject } from '../../oas/guards';
import { getComponentName, setSharedKey, syncReferenceObject } from '../../oas/resolver';
import { entries } from '../../utils';
import { Oas3TranslateFunction } from '../types';
import { translateHeaderObject } from './headers';
import { translateParameterObject } from './request';

type ParameterComponents = Pick<
  IBundledHttpService['components'],
  'query' | 'header' | 'path' | 'cookie' | 'unknownParameters'
>;

export const translateToSharedParameters = withContext<
  Oas3TranslateFunction<[components: unknown], ParameterComponents>
>(function (components) {
  const sharedParameters: ParameterComponents = {
    header: [],
    query: [],
    cookie: [],
    path: [],
    unknownParameters: [],
  };

  if (!isPlainObject(components)) return sharedParameters;

  for (const [key, value] of entries(components.headers)) {
    setSharedKey(value, key);

    this.references[`#/components/headers/${key}`] = {
      resolved: true,
      value: `#/components/header/${sharedParameters.header.length}`,
    };

    const header = translateHeaderObject.call(this, [key, value]);
    if (isNonNullable(header)) {
      sharedParameters.header.push({
        ...header,
        key,
      });
    }
  }

  const resolvables: (Reference & IComponentNode)[] = [];

  for (const [key, value] of entries(components.parameters)) {
    setSharedKey(value, key);

    if (isReferenceObject(value)) {
      // note that unlike schemas, we don't handle proxy $refs here
      // we need resolved content to be able to determine the kind of parameter to push it to the correct array
      if (value.$ref.startsWith('#')) {
        // a reference WITHIN this http-spec document
        this.references[`#/components/parameters/${key}`] = {
          resolved: false,
          value: value.$ref,
        };
      } else {
        // a reference to OUTSIDE this http-spec document
        this.references[`#/components/parameters/${key}`] = {
          resolved: true,
          value: `#/components/unknownParameters/${sharedParameters.unknownParameters.length}`,
        };
        // We have to add this to shared parameters here, rather than
        sharedParameters.unknownParameters.push({
          ...value,
          key,
        });
      }

      resolvables.push(
        syncReferenceObject(
          {
            ...value,
            key,
          },
          this.references,
        ),
      );
      continue;
    }

    if (!isValidOas3ParameterObject(value)) continue;
    const parameter = translateParameterObject.call(this, value);

    this.references[`#/components/parameters/${key}`] = {
      resolved: true,
      value: `#/components/${value.in}/${sharedParameters[value.in].length}`,
    };

    sharedParameters[value.in].push({
      ...(parameter as any),
      key,
    });
  }

  for (const resolvable of resolvables) {
    const kind = getComponentName(this.references, resolvable.$ref);

    if (kind === undefined || kind === 'unknownParameters') {
      continue; // skip it
    } else if (kind in sharedParameters) {
      sharedParameters[kind].push(resolvable);
    }
  }

  return sharedParameters;
});
