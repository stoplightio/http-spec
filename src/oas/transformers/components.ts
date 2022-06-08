import { isPlainObject } from '@stoplight/json';
import type { IBundledHttpService, Optional } from '@stoplight/types';

import { withContext } from '../../context';
import { isNonNullable } from '../../guards';
import type { ArrayCallbackParameters, Fragment, TranslateFunction } from '../../types';
import { entries } from '../../utils';

function fromNonNullableEntries<T>(entries: [key: string, value: T][]) {
  return Object.fromEntries(entries.filter(([, value]) => isNonNullable(value))) as any;
}

const invokeTranslator = withContext(function (input: unknown, translator: any) {
  return fromNonNullableEntries(entries(input).map((...args) => [args[0][0], translator.call(this, ...args)]));
});

type Translator<K extends keyof IBundledHttpService['components']> = (
  ...params: ArrayCallbackParameters<[key: string, response: unknown]>
) => Optional<IBundledHttpService['components'][K][string]>;

type Translators = {
  response: Translator<'responses'>;
  schema: Translator<'schemas'>;
  parameter: Translator<'parameters'>;
  requestBody: Translator<'requestBodies'>;
  example: Translator<'examples'>;
  securityScheme: Translator<'securitySchemes'>;
};

export const translateToComponents = withContext<
  TranslateFunction<Fragment, [root: unknown, translators: Translators], IBundledHttpService['components']>
>(function (_root, translators) {
  const root = isPlainObject(_root) ? _root : {};
  return {
    responses: invokeTranslator.call(this, root.responses, translators.response),
    schemas: invokeTranslator.call(this, root.schemas, translators.schema),
    parameters: invokeTranslator.call(this, root.parameters, translators.parameter),
    requestBodies: invokeTranslator.call(this, root.requestBodies, translators.requestBody),
    examples: invokeTranslator.call(this, root.examples, translators.example),
    securitySchemes: invokeTranslator.call(this, root.securitySchemes, translators.securityScheme),
  };
});
