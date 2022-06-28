import { DeepPartial, INodeExample } from '@stoplight/types';
import { OpenAPIObject } from 'openapi3-ts';
import { Spec } from 'swagger-schema-official';

import { withContext } from '../../context';
import { TranslateFunction } from '../../types';

export const translateToDefaultExample = withContext<
  TranslateFunction<DeepPartial<Spec | OpenAPIObject>, [key: string, value: unknown], INodeExample>
>(function (key, value) {
  const resolvedValue = this.maybeResolveLocalRef(value);

  return {
    id: this.generateId.example({ keyOrName: key }),
    value: resolvedValue,
    key,
  };
});
