import { HttpParamStyles, IHttpEncoding, IHttpHeaderParam, IMediaTypeContent, INodeExample } from '@stoplight/types';
import { compact, get, keys, map, omit, pickBy, union, values, cloneDeep } from 'lodash';
import { EncodingPropertyObject, ExampleObject, HeaderObject, MediaTypeObject, SchemaObject } from 'openapi3-ts';
import { JSONSchema6, JSONSchema4, JSONSchema7, JSONSchema4TypeName } from 'json-schema';

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

  if (!acceptableStyles.includes(encodingPropertyObject.style)) {
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
    headers: map<any, IHttpHeaderParam>(encodingPropertyObject.headers, translateHeaderObject),
  };
}

export function translateHeaderObject(headerObject: HeaderObject, name: string): IHttpHeaderParam {
  const { content: contentObject } = headerObject;

  const contentValue = values(contentObject)[0];

  const baseContent = {
    // TODO(SL-249): we are missing examples in our types, on purpose?
    // examples: parameterObject.examples,
    ...omit(headerObject, 'content', 'style', 'examples', 'example', 'schema'),
    name,
    style: (headerObject.style as any) || HttpParamStyles.Simple,
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
    schema: transformSchema(schema as SchemaObject),
    // Note that I'm assuming all references are resolved
    examples: compact(
      union<INodeExample>(
        example ? [{ key: 'default', value: example }] : undefined,
        Object.keys(examples).map<INodeExample>(exampleKey => ({
          key: exampleKey,
          value: (examples[exampleKey] as ExampleObject).value,
        })),
      ),
    ),
    encodings: map<any, IHttpEncoding>(encoding, translateEncodingPropertyObject),
  };
}

const transformExamples = (source: MediaTypeObject | HeaderObject) => (key: string) => {
  return {
    description: get(source, ['examples', key, 'description']),
    value: get(source, ['examples', key, 'value']),
    key,
  };
};

const transformSchema = (schema: SchemaObject): JSONSchema4 | JSONSchema6 | JSONSchema7 => {
  const transformedSchema = cloneDeep(schema) as JSONSchema4

  if (schema && schema.nullable)
    transformedSchema.type = [schema.type, 'null'] as JSONSchema4TypeName[]

  return transformedSchema;
}
