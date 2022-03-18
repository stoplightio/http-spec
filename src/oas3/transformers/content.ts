import { isPlainObject } from '@stoplight/json';
import {
  Dictionary,
  HttpParamStyles,
  IHttpEncoding,
  IHttpHeaderParam,
  IMediaTypeContent,
  INodeExample,
  Optional,
} from '@stoplight/types';
import type { JSONSchema7 } from 'json-schema';
import pickBy = require('lodash.pickby');

import { withJsonPath } from '../../context';
import { isBoolean, isNonNullable, isString } from '../../guards';
import { translateSchemaObject } from '../../oas/transformers/schema';
import { ArrayCallbackParameters, Fragment } from '../../types';
import { entries, maybeResolveLocalRef } from '../../utils';
import { isHeaderObject } from '../guards';
import { Oas3TranslateFunction } from '../types';

const ACCEPTABLE_STYLES: (string | undefined)[] = [
  HttpParamStyles.Form,
  HttpParamStyles.SpaceDelimited,
  HttpParamStyles.PipeDelimited,
  HttpParamStyles.DeepObject,
];

function isAcceptableStyle<T extends Fragment = Fragment>(
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

const translateEncodingPropertyObject = withJsonPath<
  Oas3TranslateFunction<
    ArrayCallbackParameters<[property: string, encodingPropertyObject: unknown]>,
    Optional<IHttpEncoding>
  >
>(function ([property, encodingPropertyObject]) {
  if (!isPlainObject(encodingPropertyObject)) return;
  if (!isAcceptableStyle(encodingPropertyObject)) return;

  this.state.enter('encoding', property);

  return {
    property,
    explode: !!(encodingPropertyObject.explode ?? encodingPropertyObject.style === HttpParamStyles.Form),
    style: encodingPropertyObject.style,
    headers: entries(encodingPropertyObject.headers).map(translateHeaderObject, this).filter(isNonNullable),

    ...pickBy(
      {
        allowReserved: encodingPropertyObject.allowReserved,
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

export const translateHeaderObject = withJsonPath<
  Oas3TranslateFunction<ArrayCallbackParameters<[name: string, headerObject: unknown]>, Optional<IHttpHeaderParam>>
>(function ([name, unresolvedHeaderObject]) {
  const headerObject = this.maybeResolveLocalRef(unresolvedHeaderObject);
  if (!isPlainObject(headerObject)) return;

  this.state.enter('headers', name);
  const id = this.generateId('header');

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
    explode: !!headerObject.explode,

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

const translateSchemaMediaTypeObject = withJsonPath<Oas3TranslateFunction<[schema: unknown], Optional<JSONSchema7>>>(
  function (schema) {
    if (!isPlainObject(schema)) return;

    this.state.enter('schema');
    return translateSchemaObject.call(this, schema);
  },
);

export const translateMediaTypeObject = withJsonPath<
  Oas3TranslateFunction<ArrayCallbackParameters<[mediaType: string, mediaObject: unknown]>, Optional<IMediaTypeContent>>
>(function ([mediaType, mediaObject]) {
  if (!isPlainObject(mediaObject)) return;

  this.state.enter('content', mediaType);

  const resolvedMediaObject = resolveMediaObject(this.state.document, mediaObject);
  const { schema, encoding, examples } = resolvedMediaObject;

  const jsonSchema = translateSchemaMediaTypeObject.call(this, schema);

  const example = resolvedMediaObject.example || jsonSchema?.examples?.[0];

  return {
    id: this.generateId('media-type'),
    mediaType,
    // Note that I'm assuming all references are resolved
    examples: [
      example ? translateToDefaultExample.call(this, 'default', example) : undefined,
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

function resolveMediaObject(document: unknown, maybeMediaObject: Dictionary<unknown>) {
  const mediaObject = { ...maybeMediaObject };
  if (isPlainObject(mediaObject.schema)) {
    mediaObject.schema = maybeResolveLocalRef(document, mediaObject.schema);
  }

  if (isPlainObject(mediaObject.examples)) {
    const examples = { ...mediaObject.examples };
    mediaObject.examples = examples;
    for (const [exampleName, exampleValue] of entries(examples)) {
      examples[exampleName] = maybeResolveLocalRef(document, exampleValue);
    }
  }

  return mediaObject;
}

const translateToDefaultExample = withJsonPath<Oas3TranslateFunction<[key: string, value: unknown], INodeExample>>(
  function (key, value) {
    this.state.enter('example');

    return {
      id: this.generateId('example'),
      value,
      key,
    };
  },
);

const translateToExample = withJsonPath<
  Oas3TranslateFunction<ArrayCallbackParameters<[key: string, example: unknown]>, Optional<INodeExample>>
>(function ([key, example]) {
  if (!isPlainObject(example)) return;

  this.state.enter('examples', key);

  return {
    id: this.generateId('example'),
    value: example.value,
    key,

    ...pickBy(
      {
        summary: example.summary,
        description: example.description,
      },
      isString,
    ),
  };
});
