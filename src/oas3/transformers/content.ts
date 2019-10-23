import { Dictionary, HttpParamStyles, IHttpEncoding, IHttpHeaderParam, IMediaTypeContent, INodeExample, Optional } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { compact, get, isObject, keys, map, omit, pickBy, union, values } from 'lodash';

// @ts-ignore
import * as toJsonSchema from 'openapi-schema-to-json-schema';
import { EncodingPropertyObject, HeaderObject, MediaTypeObject } from 'openapi3-ts';
import { isHeaderObject } from '../guards';

function translateEncodingPropertyObject(
  encodingPropertyObject: EncodingPropertyObject,
  property: string,
): IHttpEncoding {
  const acceptableStyles: Array<string | undefined> = [
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
  { schema, example, examples = {}, encoding }: MediaTypeObject,
  mediaType: string,
): IMediaTypeContent {
  return {
    mediaType,
    schema: schema
      ? (toJsonSchema(schema, {
          cloneSchema: true,
          strictMode: false,
          keepNotSupported: ['example'],
        }) as JSONSchema4)
      : undefined,
    // Note that I'm assuming all references are resolved
    examples: compact(
      union<INodeExample>(
        example ? [{ key: 'default', value: example }] : undefined,
        Object.keys(examples).map<INodeExample>(exampleKey => ({
          key: exampleKey,
          summary: get(examples, [exampleKey, 'summary']),
          description: get(examples, [exampleKey, 'description']),
          value: get(examples, [exampleKey, 'value']),
        })),
      ),
    ),
    encodings: map<any, IHttpEncoding>(encoding, translateEncodingPropertyObject),
  };
}

const transformExamples = (source: MediaTypeObject | HeaderObject) => (key: string): INodeExample => {
  return {
    summary: get(source, ['examples', key, 'summary']),
    description: get(source, ['examples', key, 'description']),
    value: get(source, ['examples', key, 'value']),
    key,
  };
};
