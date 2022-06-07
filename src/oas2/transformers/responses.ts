import { isPlainObject } from '@stoplight/json';
import type { DeepPartial, IHttpOperationResponse, IMediaTypeContent, Optional } from '@stoplight/types';
import pickBy = require('lodash.pickby');
import type { Operation, Reference } from 'swagger-schema-official';

import { withContext } from '../../context';
import { isNonNullable } from '../../guards';
import { isReferenceObject } from '../../oas/guards';
import { getSharedKey } from '../../oas/resolver';
import { translateToDefaultExample } from '../../oas/transformers/examples';
import { translateSchemaObject } from '../../oas/transformers/schema';
import { entries } from '../../utils';
import { getExamplesFromSchema, getProduces } from '../accessors';
import { isResponseObject } from '../guards';
import { Oas2TranslateFunction } from '../types';
import { translateToHeaderParams } from './params';

const translateToResponse = withContext<
  Oas2TranslateFunction<
    [produces: string[], statusCode: string, response: unknown],
    Optional<IHttpOperationResponse | Reference>
  >
>(function (produces, statusCode, response) {
  const maybeResponseObject = this.maybeResolveLocalRef(response);

  if (isReferenceObject(maybeResponseObject)) return maybeResponseObject;
  if (!isResponseObject(maybeResponseObject)) return;

  const actualKey = this.context === 'service' ? getSharedKey(maybeResponseObject) : statusCode;

  const headers = translateToHeaderParams.call(this, maybeResponseObject.headers);
  const objectifiedExamples = entries(
    maybeResponseObject.examples || getExamplesFromSchema(maybeResponseObject.schema),
  ).map(([key, value]) => translateToDefaultExample.call(this, key, value));

  const contents = produces
    .map<IMediaTypeContent & { examples: NonNullable<IMediaTypeContent['examples']> }>(
      withContext(produceElement => ({
        id: this.generateId(`http_media-${this.parentId}-${produceElement}`),
        mediaType: produceElement,
        examples: objectifiedExamples.filter(example => example.key === produceElement),
        ...pickBy(
          {
            schema: isPlainObject(maybeResponseObject.schema)
              ? translateSchemaObject.call(this, maybeResponseObject.schema)
              : undefined,
          },
          isNonNullable,
        ),
      })),
      this,
    )
    .filter(({ schema, examples }) => !!schema || examples.length > 0);

  const translatedResponses = {
    id: this.generateId(`http_response-${this.parentId}-${actualKey}`),
    code: statusCode,
    description: maybeResponseObject.description,
    headers,
    contents,
  };

  const foreignExamples = objectifiedExamples.filter(example => !produces.includes(example.key));
  if (foreignExamples.length > 0) {
    if (translatedResponses.contents.length === 0)
      translatedResponses.contents[0] = {
        id: this.generateId(`http_media-${this.parentId}-`),
        mediaType: '',
        schema: {},
        examples: [],
      };

    translatedResponses.contents[0].examples!.push(...foreignExamples);
  }

  return translatedResponses;
});

export const translateToResponses: Oas2TranslateFunction<
  [operation: DeepPartial<Operation>],
  (IHttpOperationResponse | Reference)[]
> = function (operation) {
  const produces = getProduces(this.document, operation);
  return entries(operation.responses)
    .map(([statusCode, response]) => translateToResponse.call(this, produces, statusCode, response))
    .filter(isNonNullable);
};
