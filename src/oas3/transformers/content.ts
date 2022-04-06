import { isPlainObject } from '@stoplight/json';
import {
  HttpParamStyles,
  IHttpEncoding,
  IHttpHeaderParam,
  IMediaTypeContent,
  INodeExample,
  Optional,
} from '@stoplight/types';
import type { JSONSchema7 } from 'json-schema';
import pickBy = require('lodash.pickby');

import { withContext } from '../../context';
import { isBoolean, isNonNullable, isString } from '../../guards';
import { translateToDefaultExample } from '../../oas/transformers/examples';
import { translateSchemaObject } from '../../oas/transformers/schema';
import { ArrayCallbackParameters, Fragment } from '../../types';
import { entries } from '../../utils';
import { isHeaderObject } from '../guards';
import { Oas3TranslateFunction } from '../types';
import { translateToExample } from './examples';

const ACCEPTABLE_STYLES: (string | undefined)[] = [
  HttpParamStyles.Form,
  HttpParamStyles.SpaceDelimited,
  HttpParamStyles.PipeDelimited,
  HttpParamStyles.DeepObject,
];

function hasAcceptableStyle<T extends Fragment = Fragment>(
  encodingPropertyObject: T,
): encodingPropertyObject is T & {
  style:
    | HttpParamStyles.Form
    | HttpParamStyles.SpaceDelimited
    | HttpParamStyles.PipeDelimited
    | HttpParamStyles.DeepObject;
} {
  return typeof encodingPropertyObject.style === 'string' && ACCEPTABLE_STYLES.includes(encodingPropertyObject.style);
}

const translateEncodingPropertyObject = withContext<
  Oas3TranslateFunction<
    ArrayCallbackParameters<[property: string, encodingPropertyObject: unknown]>,
    Optional<IHttpEncoding>
  >
>(function ([property, encodingPropertyObject]) {
  if (!isPlainObject(encodingPropertyObject)) return;
  if (!hasAcceptableStyle(encodingPropertyObject)) return;

  return {
    property,
    style: encodingPropertyObject.style,
    headers: entries(encodingPropertyObject.headers).map(translateHeaderObject, this).filter(isNonNullable),

    ...pickBy(
      {
        allowReserved: encodingPropertyObject.allowReserved,
        explode: encodingPropertyObject.explode,
      },
      isBoolean,
    ),

    ...pickBy(
      {
        mediaType: encodingPropertyObject.contentType,
      },
      isString,
    ),
  };
});

export const translateHeaderObject = withContext<
  Oas3TranslateFunction<ArrayCallbackParameters<[name: string, headerObject: unknown]>, Optional<IHttpHeaderParam>>
>(function ([name, unresolvedHeaderObject]) {
  const headerObject = this.maybeResolveLocalRef(unresolvedHeaderObject);
  if (!isPlainObject(headerObject)) return;

  const id = this.generateId(`http_header-${this.parentId}-${name}`, 'long');

  if (!isHeaderObject(headerObject)) {
    return {
      id,
      encodings: [],
      examples: [],
      name,
      style: HttpParamStyles.Simple,
    };
  }

  const { content: contentObject } = headerObject;

  const contentValue = isPlainObject(contentObject) ? Object.values(contentObject)[0] : null;

  const baseContent: IHttpHeaderParam = {
    id,
    name,
    style: HttpParamStyles.Simple,

    ...pickBy(
      {
        schema: isPlainObject(headerObject.schema) ? translateSchemaObject.call(this, headerObject.schema) : null,
        content: headerObject.content,
      },
      isNonNullable,
    ),

    ...pickBy(
      {
        description: headerObject.description,
      },
      isString,
    ),

    ...pickBy(
      {
        allowEmptyValue: headerObject.allowEmptyValue,
        allowReserved: headerObject.allowReserved,
        explode: headerObject.explode,
        required: headerObject.required,
        deprecated: headerObject.deprecated,
      },
      isBoolean,
    ),
  };

  const examples: INodeExample[] = [];
  const encodings: IHttpEncoding[] = [];

  if (isPlainObject(contentValue)) {
    examples.push(...entries(contentValue.examples).map(translateToExample, this).filter(isNonNullable));

    if (isPlainObject(contentValue.encoding)) {
      encodings.push(...(Object.values(contentValue.encoding) as IHttpEncoding[]));
    }

    if ('example' in contentValue) {
      examples.push(translateToDefaultExample.call(this, '__default_content', contentValue.example));
    }
  }

  examples.push(...entries(headerObject.examples).map(translateToExample, this).filter(isNonNullable));

  if ('example' in headerObject) {
    examples.push(translateToDefaultExample.call(this, '__default', headerObject.example));
  }

  return {
    ...baseContent,
    encodings,
    examples,
  };
});

const translateSchemaMediaTypeObject = withContext<Oas3TranslateFunction<[schema: unknown], Optional<JSONSchema7>>>(
  function (schema) {
    if (!isPlainObject(schema)) return;

    return translateSchemaObject.call(this, schema);
  },
);

export const translateMediaTypeObject = withContext<
  Oas3TranslateFunction<ArrayCallbackParameters<[mediaType: string, mediaObject: unknown]>, Optional<IMediaTypeContent>>
>(function ([mediaType, mediaObject]) {
  if (!isPlainObject(mediaObject)) return;

  const id = this.generateId(`http_media-${this.parentId}-${mediaType}`, 'long');
  const { schema, encoding, examples } = mediaObject;
  const jsonSchema = translateSchemaMediaTypeObject.call(this, schema);

  const defaultExample = 'example' in mediaObject ? mediaObject.example : jsonSchema?.examples?.[0];

  return {
    id,
    mediaType,
    // Note that I'm assuming all references are resolved
    examples: [
      defaultExample !== undefined ? translateToDefaultExample.call(this, 'default', defaultExample) : undefined,
      ...entries(examples).map(translateToExample, this),
    ].filter(isNonNullable),
    encodings: entries(encoding).map(translateEncodingPropertyObject, this).filter(isNonNullable),

    ...pickBy(
      {
        schema: jsonSchema,
      },
      isNonNullable,
    ),
  };
});
