import {
  DeepPartial,
  Dictionary,
  HttpParamStyles,
  IHttpEncoding,
  IHttpHeaderParam,
  IMediaTypeContent,
  INodeExample,
  Optional,
} from '@stoplight/types';
import { JSONSchema7 } from 'json-schema';
import { compact, each, get, isObject, keys, map, omit, pickBy, union, values } from 'lodash';
import { EncodingPropertyObject, HeaderObject, MediaTypeObject, OpenAPIObject } from 'openapi3-ts';

import { translateSchemaObject } from '../../oas/transformers/schema';
import { isDictionary, maybeResolveLocalRef } from '../../utils';
import { isHeaderObject } from '../guards';

function translateEncodingPropertyObject(
  encodingPropertyObject: EncodingPropertyObject,
  property: string,
): IHttpEncoding {
  const acceptableStyles: (string | undefined)[] = [
    HttpParamStyles.Form,
    HttpParamStyles.SpaceDelimited,
    HttpParamStyles.PipeDelimited,
    HttpParamStyles.DeepObject,
  ];

  if (encodingPropertyObject.style && !acceptableStyles.includes(encodingPropertyObject.style)) {
    throw new Error(
      `Encoding property style: '${encodingPropertyObject.style}' is incorrect, must be one of: ${acceptableStyles}`,
    );
  }

  return {
    property,
    ...encodingPropertyObject,
    // workaround for 'style' being one of the accepted HttpParamStyles
    style: encodingPropertyObject.style as any,
    mediaType: encodingPropertyObject.contentType,
    headers: compact<IHttpHeaderParam>(
      map<Dictionary<unknown> & unknown, Optional<IHttpHeaderParam>>(
        encodingPropertyObject.headers,
        translateHeaderObject,
      ),
    ),
  };
}

export function translateHeaderObject(headerObject: unknown, name: string): Optional<IHttpHeaderParam> {
  if (!isObject(headerObject)) return;

  if (!isHeaderObject(headerObject)) {
    return {
      encodings: [],
      examples: [],
      name,
      style: HttpParamStyles.Simple,
    };
  }

  const { content: contentObject } = headerObject;

  const contentValue = values(contentObject)[0];

  const baseContent = {
    // TODO(SL-249): we are missing examples in our types, on purpose?
    // examples: parameterObject.examples,
    ...omit(headerObject, 'content', 'style', 'examples', 'example', 'schema'),
    name,
    style: headerObject?.style ?? HttpParamStyles.Simple,
  };

  const examples: INodeExample[] = [];
  const encodings: IHttpEncoding[] = [];

  if (contentValue) {
    examples.push(...keys(contentValue.examples).map<INodeExample>(transformExamples(contentValue)));

    encodings.push(...values<IHttpEncoding>(contentValue.encoding));

    if (contentValue.example) {
      examples.push({
        key: '__default_content',
        value: contentValue.example,
      });
    }
  }

  examples.push(...keys(headerObject.examples).map<INodeExample>(transformExamples(headerObject)));

  if (headerObject.example) {
    examples.push({
      key: '__default',
      value: headerObject.example,
    });
  }

  return (pickBy({
    ...baseContent,
    schema: get(headerObject, 'schema') as any,
    encodings,
    examples,
  }) as unknown) as IHttpHeaderParam;
}

export function translateMediaTypeObject(
  document: DeepPartial<OpenAPIObject>,
  mediaObject: unknown,
  mediaType: string,
): Optional<IMediaTypeContent> {
  if (!isDictionary(mediaObject)) return;

  const resolvedMediaObject = resolveMediaObject(document, mediaObject);
  const { schema, encoding, examples } = resolvedMediaObject;

  let jsonSchema: Optional<JSONSchema7>;

  if (isObject(schema)) {
    try {
      jsonSchema = translateSchemaObject(schema);
    } catch {
      // happens
    }
  }

  const example = resolvedMediaObject.example || jsonSchema?.examples?.[0];

  return {
    mediaType,
    schema: jsonSchema,
    // Note that I'm assuming all references are resolved
    examples: compact(
      union<INodeExample>(
        example ? [{ key: 'default', value: example }] : undefined,
        isDictionary(examples)
          ? Object.keys(examples).map<INodeExample>(exampleKey => ({
              key: exampleKey,
              summary: get(examples, [exampleKey, 'summary']),
              description: get(examples, [exampleKey, 'description']),
              value: get(examples, [exampleKey, 'value']),
            }))
          : [],
      ),
    ),
    encodings: map<any, IHttpEncoding>(encoding, translateEncodingPropertyObject),
  };
}

function resolveMediaObject(document: DeepPartial<OpenAPIObject>, maybeMediaObject: Dictionary<unknown>) {
  const mediaObject = { ...maybeMediaObject };
  if (isDictionary(mediaObject.schema)) {
    mediaObject.schema = maybeResolveLocalRef(document, mediaObject.schema);
  }

  if (isDictionary(mediaObject.examples)) {
    const examples = { ...mediaObject.examples };
    mediaObject.examples = examples;
    each(examples, (exampleValue, exampleName) => {
      examples[exampleName] = maybeResolveLocalRef(document, exampleValue);
    });
  }

  return mediaObject;
}

const transformExamples = (source: MediaTypeObject | HeaderObject) => (key: string): INodeExample => {
  return {
    summary: get(source, ['examples', key, 'summary']),
    description: get(source, ['examples', key, 'description']),
    value: get(source, ['examples', key, 'value']),
    key,
  };
};
