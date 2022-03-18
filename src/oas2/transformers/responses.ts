import { isPlainObject } from '@stoplight/json';
import type { IHttpOperationResponse, Optional } from '@stoplight/types';
import { DeepPartial } from '@stoplight/types';
import { Operation } from 'swagger-schema-official';

import { isNonNullable } from '../../guards';
import { translateSchemaObject } from '../../oas/transformers/schema';
import { entries } from '../../utils';
import { getExamplesFromSchema, getProduces } from '../accessors';
import { isResponseObject } from '../guards';
import { Oas2TranslateFunction } from '../types';
import { translateToHeaderParams } from './params';

const translateToResponse: Oas2TranslateFunction<
  [produces: string[], statusCode: string, response: unknown],
  Optional<IHttpOperationResponse>
> = function (produces, statusCode, response) {
  const resolvedResponse = this.maybeResolveLocalRef(response);
  if (!isResponseObject(resolvedResponse)) return;

  this.state.enter('responses', statusCode);

  const headers = translateToHeaderParams.call(this, resolvedResponse.headers);
  const objectifiedExamples = entries(
    resolvedResponse.examples || (resolvedResponse.schema ? getExamplesFromSchema(resolvedResponse.schema) : void 0),
  ).map(([key, value]) => ({ id: this.generateId('example'), key, value }));

  const contents = produces
    .map(produceElement => ({
      id: this.generateId('security'),
      mediaType: produceElement,
      schema: isPlainObject(resolvedResponse.schema)
        ? translateSchemaObject.call(this, resolvedResponse.schema)
        : void 0,
      examples: objectifiedExamples.filter(example => example.key === produceElement),
    }))
    .filter(({ schema, examples }) => !!schema || examples.length > 0);

  const translatedResponses = {
    id: this.generateId('security'),
    code: statusCode,
    description: resolvedResponse.description,
    headers,
    contents,
  };

  const foreignExamples = objectifiedExamples.filter(example => !produces.includes(example.key));
  if (foreignExamples.length > 0) {
    if (translatedResponses.contents.length === 0)
      translatedResponses.contents[0] = {
        id: this.generateId('param'),
        mediaType: '',
        schema: {},
        examples: [],
      };

    translatedResponses.contents[0].examples!.push(...foreignExamples);
  }

  return translatedResponses;
};

export const translateToResponses: Oas2TranslateFunction<
  [operation: DeepPartial<Operation>],
  IHttpOperationResponse[]
> = function (operation) {
  const produces = getProduces(this.document, operation);
  return entries(operation.responses)
    .map(([statusCode, response]) => translateToResponse.call(this, produces, statusCode, response))
    .filter(isNonNullable);
};
