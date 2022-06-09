import { isPlainObject } from '@stoplight/json';
import { IBundledHttpService, Reference } from '@stoplight/types';

import { withContext } from '../../context';
import { isNonNullable } from '../../guards';
import { isReferenceObject, isValidOas3ParameterObject } from '../../oas/guards';
import { getComponentName, setSharedKey } from '../../oas/resolver';
import { entries } from '../../utils';
import { Oas3TranslateFunction } from '../types';
import { translateHeaderObject } from './headers';
import { translateParameterObject } from './request';

type ParameterComponents = Pick<IBundledHttpService['components'], 'query' | 'header' | 'path' | 'cookie'>;

export const translateToSharedParameters = withContext<
  Oas3TranslateFunction<[components: unknown], ParameterComponents>
>(function (components) {
  const sharedParameters: ParameterComponents = {
    header: [],
    query: [],
    cookie: [],
    path: [],
  };

  if (!isPlainObject(components)) return sharedParameters;

  for (const [key, value] of entries(components.headers)) {
    setSharedKey(value, key);

    this.$refs[`#/components/headers/${key}`] = `#/components/header/${sharedParameters.header.length}`;
    const header = translateHeaderObject.call(this, [key, value]);
    if (isNonNullable(header)) {
      sharedParameters.header.push({
        ...header,
        key,
      });
    }
  }

  const resolvables: [string, Reference][] = [];

  for (const [key, value] of entries(components.parameters)) {
    setSharedKey(value, key);

    if (isReferenceObject(value)) {
      resolvables.push([key, value]);
      continue;
    }

    if (!isValidOas3ParameterObject(value)) continue;
    const parameter = translateParameterObject.call(this, value);

    this.$refs[`#/components/parameters/${key}`] = `#/components/${value.in}/${sharedParameters[value.in].length}`;
    sharedParameters[value.in].push({
      ...(parameter as any),
      key,
    });
  }

  for (const [key, value] of resolvables) {
    const mapped = this.$refs[value.$ref];
    if (mapped === void 0) continue;
    const kind = getComponentName(mapped) as keyof ParameterComponents;

    this.$refs[`#/components/parameters/${key}`] = `#/components/${kind}/${sharedParameters[kind].length}`;
    sharedParameters[kind].push({
      ...value,
      key,
    });
  }

  return sharedParameters;
});
