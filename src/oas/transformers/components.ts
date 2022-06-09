import { isPlainObject } from '@stoplight/json';
import type { IBundledHttpService, IComponentNode, Optional } from '@stoplight/types';
import { Reference } from '@stoplight/types';

import { isNonNullable } from '../../guards';
import type { ArrayCallbackParameters, Fragment, TransformerContext } from '../../types';
import { entries } from '../../utils';
import { isReferenceObject } from '../guards';
import { setSharedKey } from '../resolver';
import { OasVersion } from '../types';

interface Components {
  responses: IBundledHttpService['components']['responses'];
  definitions: IBundledHttpService['components']['schemas'];
  schemas: IBundledHttpService['components']['schemas'];
  requestBodies: IBundledHttpService['components']['requestBodies'];
  examples: IBundledHttpService['components']['examples'];
  securitySchemes: IBundledHttpService['components']['securitySchemes'];
  securityDefinitions: IBundledHttpService['components']['securitySchemes'];
}

type Translator<K extends keyof Components> = (
  ...params: ArrayCallbackParameters<[key: string, response: unknown]>
) => Optional<Omit<Components[K][number], 'key'>>;

type Translators = {
  responses: Translator<'responses'>;
  definitions?: Translator<'schemas'>;
  schemas?: Translator<'schemas'>;
  requestBodies?: Translator<'requestBodies'>;
  examples?: Translator<'examples'>;
  securitySchemes?: Translator<'securitySchemes'>;
  securityDefinitions?: Translator<'securitySchemes'>;
};

function createInvokeTranslator(
  this: TransformerContext<Fragment>,
  root: '#/components' | '#',
  translators: Translators,
) {
  const input = root === '#/components' ? this.document.components : this.document;

  return <K extends keyof Components = keyof Components>(
    kind: K,
    component: keyof IBundledHttpService['components'],
  ): Components[K] => {
    const translator = translators[kind];
    if (translator === void 0 || !isPlainObject(input)) return [];

    const objects: Components[K] = [];
    const items = entries(input[kind]);

    const resolvables: (Reference & IComponentNode)[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const [key, value] = item;
      setSharedKey(value, key);

      if (isReferenceObject(value)) {
        const resolvableComponent = {
          ...value,
          key,
        };

        objects.push(resolvableComponent);
        resolvables.push(resolvableComponent);
        continue;
      }

      const translated = translator.call(this, items[i], i, items);
      if (!isNonNullable(translated)) continue;

      this.references[`${root}/${kind}/${key}`] = `#/components/${component}/${objects.length}`;
      (translated as Components[K][number]).key = key;
      objects.push(translated as any);
    }

    for (const resolvable of resolvables) {
      const mapped = this.references[resolvable.$ref];
      if (mapped === void 0) continue;

      this.references[resolvable.$ref] = mapped;
      resolvable.$ref = mapped;
    }

    return objects;
  };
}

export const translateToComponents = function (
  this: TransformerContext<Fragment>,
  spec: OasVersion,
  translators: Translators,
): Pick<IBundledHttpService['components'], 'responses' | 'schemas' | 'requestBodies' | 'examples' | 'securitySchemes'> {
  const root = spec === OasVersion.OAS3 ? '#/components' : '#';

  const invokeTranslator = createInvokeTranslator.call(this, root, translators);

  return {
    responses: invokeTranslator('responses', 'responses'),
    schemas: invokeTranslator(spec === OasVersion.OAS3 ? 'schemas' : 'definitions', 'schemas'),
    requestBodies: invokeTranslator('requestBodies', 'requestBodies'),
    examples: invokeTranslator('examples', 'examples'),
    securitySchemes: invokeTranslator(
      spec === OasVersion.OAS3 ? 'securitySchemes' : 'securityDefinitions',
      'securitySchemes',
    ),
  };
};
