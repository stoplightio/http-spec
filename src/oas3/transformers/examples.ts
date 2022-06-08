import { isPlainObject } from '@stoplight/json';
import type { INodeExample, INodeExternalExample, Optional, Reference } from '@stoplight/types';
import pickBy = require('lodash.pickby');

import { withContext } from '../../context';
import { isString } from '../../guards';
import { isReferenceObject } from '../../oas/guards';
import { getSharedKey } from '../../oas/resolver';
import type { ArrayCallbackParameters } from '../../types';
import type { Oas3TranslateFunction } from '../types';

export const translateToExample = withContext<
  Oas3TranslateFunction<
    ArrayCallbackParameters<[key: string, example: unknown]>,
    Optional<INodeExample | INodeExternalExample | Reference>
  >
>(function ([key, example]) {
  const maybeExample = this.maybeResolveLocalRef(example);

  if (!isPlainObject(maybeExample)) return;
  if (isReferenceObject(maybeExample)) return maybeExample;

  const actualKey = this.context === 'service' ? getSharedKey(maybeExample) : key;

  return {
    id: this.generateId(`example-${this.parentId}-${actualKey}`),
    key,

    ...(typeof maybeExample.externalValue === 'string'
      ? { externalValue: maybeExample.externalValue }
      : { value: maybeExample.value }),

    ...pickBy(
      {
        summary: maybeExample.summary,
        description: maybeExample.description,
      },
      isString,
    ),
  };
});
