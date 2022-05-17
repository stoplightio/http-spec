import { isPlainObject } from '@stoplight/json';
import { INodeExample, INodeExternalExample, Optional } from '@stoplight/types';
import pickBy = require('lodash.pickby');

import { withContext } from '../../context';
import { isString } from '../../guards';
import { getSharedKey } from '../../oas/resolver';
import type { ArrayCallbackParameters } from '../../types';
import type { Oas3TranslateFunction } from '../types';

export const translateToExample = withContext<
  Oas3TranslateFunction<
    ArrayCallbackParameters<[key: string, example: unknown]>,
    Optional<INodeExample | INodeExternalExample>
  >
>(function ([key, example]) {
  const resolvedExample = this.maybeResolveLocalRef(example);

  if (!isPlainObject(resolvedExample)) return;

  const actualKey = this.context === 'service' ? getSharedKey(resolvedExample) : key;

  return {
    id: this.generateId(`example-${this.parentId}-${actualKey}`),
    key,

    ...(typeof resolvedExample.externalValue === 'string'
      ? { externalValue: resolvedExample.externalValue }
      : { value: resolvedExample.value }),

    ...pickBy(
      {
        summary: resolvedExample.summary,
        description: resolvedExample.description,
      },
      isString,
    ),
  };
});
