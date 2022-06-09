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
};

function invokeTranslator<K extends keyof Components = keyof Components>(
  ctx: TransformerContext<Fragment>,
  root: '#/components' | '#',
  translators: Translators,
  kind: K,
): Components[K] {
  const translator = translators[kind];
  const input = root === '#/components' ? ctx.document.components : ctx.document;
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

    const translated = translator.call(ctx, items[i], i, items);
    if (!isNonNullable(translated)) continue;

    ctx.$refs[`${root}/${kind}/${key}`] = `#/components/${kind === 'definitions' ? 'schemas' : kind}/${objects.length}`;
    (translated as Components[K][number]).key = key;
    objects.push(translated as any);
  }

  for (const resolvable of resolvables) {
    const mapped = ctx.$refs[resolvable.$ref];
    if (mapped === void 0) continue;

    ctx.$refs[resolvable.$ref] = mapped;
    resolvable.$ref = mapped;
  }

  return objects;
}

export const translateToComponents = function (
  this: TransformerContext<Fragment>,
  spec: OasVersion,
  translators: Translators,
): Pick<IBundledHttpService['components'], 'responses' | 'schemas' | 'requestBodies' | 'examples' | 'securitySchemes'> {
  const root = spec === OasVersion.OAS3 ? '#/components' : '#';

  return {
    // TS doesn't seem to like .call(this) here
    responses: invokeTranslator(this, root, translators, 'responses'),
    schemas: invokeTranslator(this, root, translators, spec === OasVersion.OAS3 ? 'schemas' : 'definitions'),
    requestBodies: invokeTranslator(this, root, translators, 'requestBodies'),
    examples: invokeTranslator(this, root, translators, 'examples'),
    securitySchemes: invokeTranslator(this, root, translators, 'securitySchemes'),
  };
};
