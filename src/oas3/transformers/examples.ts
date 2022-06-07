import { isPlainObject } from '@stoplight/json';
import { INodeExample, INodeExternalExample, Optional } from '@stoplight/types';
import pickBy = require('lodash.pickby');
import { ReferenceObject } from 'openapi3-ts';

import { withContext } from '../../context';
import { isString } from '../../guards';
import { isReferenceObject } from '../../oas/guards';
import { getSharedKey } from '../../oas/resolver';
import type { ArrayCallbackParameters } from '../../types';
import type { Oas3TranslateFunction } from '../types';

export const translateToExample = withContext<
  Oas3TranslateFunction<
    ArrayCallbackParameters<[key: string, example: unknown]>,
    Optional<INodeExample | INodeExternalExample | ReferenceObject>
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
