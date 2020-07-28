import {
  IHttpOperation,
  IHttpOperationRequestBody,
  IHttpParam,
  IMediaTypeContent,
  INodeExample,
  INodeExternalExample,
  IServer,
} from '@stoplight/types';
import type { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
import { isEqual } from 'lodash';

type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;

function isExclusivelyAnyOfSchema(schema: JSONSchema): schema is { anyOf: JSONSchema7[] } {
  return !!(schema.anyOf && Object.keys(schema).length === 1);
}

function mergeSchemas(schema1: JSONSchema, schema2: JSONSchema): JSONSchema {
  const schemas = (isExclusivelyAnyOfSchema(schema2) ? schema2.anyOf : [schema2]).reduce<Array<JSONSchema>>(
    (schemas, schema) => {
      if (!schemas.find(s => isEqual(s, schema))) {
        return schemas.concat(schema);
      }
      return schemas;
    },
    isExclusivelyAnyOfSchema(schema1) ? schema1.anyOf : [schema1],
  );

  return schemas.length === 1 ? schemas[0] : { anyOf: schemas as JSONSchema7[] };
}

function mergeParams<T extends IHttpParam>(params1: T[], params2: T[]): T[] {
  const params1OnlyAndCommon = params1.map(p1 => {
    const p2 = params2.find(p2 => p2.name.toLowerCase() === p1.name.toLowerCase());

    if (p2) {
      return {
        ...p2,
        ...p1,
        required: p1.required && p2.required,
        schema: p1.schema && p2.schema ? mergeSchemas(p1.schema, p2.schema) : p1.schema ? p1.schema : p2.schema,
      };
    } else {
      return {
        ...p1,
        required: false,
      };
    }
  });

  const params2Only = params2
    .filter(p2 => !params1.find(p1 => p1.name.toLowerCase() === p2.name.toLowerCase()))
    .map(h2 => ({ ...h2, required: false }));

  return [...params1OnlyAndCommon, ...params2Only];
}

const mergeContents = mergeLists<IMediaTypeContent[]>(
  (c1, c2) => c1.mediaType.toLowerCase() === c2.mediaType.toLowerCase(),
  (c1, c2) => {
    return {
      mediaType: c1.mediaType,
      schema: c1.schema && c2.schema ? mergeSchemas(c1.schema, c2.schema) : c1.schema ? c1.schema : c2.schema,
      examples: mergeContentExamples([c1.examples, c2.examples]),
      encodings: mergeContentEncodings([c1.encodings, c2.encodings]),
    };
  },
);

function mergeContentExamples(exampleLists: Array<IMediaTypeContent['examples']>) {
  return exampleLists.reduce<Array<INodeExample | INodeExternalExample> | undefined>((merged, examples) => {
    if (!examples) return merged;

    const arr = (Array.isArray(examples) ? examples : [examples]).filter(
      ex => !(merged || []).find(me => isEqual(me, ex)),
    );

    return merged ? merged.concat(arr) : arr;
  }, undefined);
}

function mergeContentEncodings(encodingLists: Array<IMediaTypeContent['encodings']>) {
  return encodingLists.reduce<IMediaTypeContent['encodings']>((merged, encodings) => {
    if (!encodings) return merged;

    const arr = encodings.filter(enc => !(merged || []).find(me => isEqual(me, enc)));

    return merged ? merged.concat(arr) : arr;
  }, undefined);
}

export const mergeResponses = mergeLists<IHttpOperation['responses']>(
  (r1, r2) => r1.code === r2.code,
  (r1, r2) => ({
    ...r1,
    headers: mergeParams(r1.headers || [], r2.headers || []),
    contents: mergeContents(r1.contents || [], r2.contents || []),
  }),
);

function mergeRequestBodies(b1: IHttpOperationRequestBody, b2: IHttpOperationRequestBody): IHttpOperationRequestBody {
  return {
    description: [b1.description, b2.description].filter(_ => _).join('; ') || undefined,
    required: b1.required && b2.required,
    contents: mergeContents(b1.contents || [], b2.contents || []),
  };
}

const mergeServers = mergeLists<IServer[]>(
  (s1, s2) => s1.url === s2.url,
  s1 => s1, // ignore server #2 is url is equal
);

export const mergeOperations = mergeLists<IHttpOperation[]>(
  (o1, o2) => o1.path === o2.path && o1.method.toLowerCase() === o2.method.toLowerCase(),
  (o1, o2) => ({
    ...o1,
    request: {
      ...o1.request,
      path:
        o1.request?.path && o2.request?.path
          ? mergeParams(o1.request?.path, o2.request?.path)
          : o1.request?.path
          ? o1.request?.path
          : o2.request?.path,
      query:
        o1.request?.query && o2.request?.query
          ? mergeParams(o1.request?.query, o2.request?.query)
          : o1.request?.query
          ? o1.request?.query
          : o2.request?.query,
      body:
        o1.request?.body && o2.request?.body
          ? mergeRequestBodies(o1.request?.body, o2.request?.body)
          : o1.request?.body
          ? o1.request?.body
          : o2.request?.body,
      headers:
        o1.request?.headers && o2.request?.headers
          ? mergeParams(o1.request?.headers, o2.request?.headers)
          : o1.request?.headers
          ? o1.request?.headers
          : o2.request?.headers,
    },
    responses: mergeResponses(o1.responses, o2.responses) as IHttpOperation['responses'],
    servers: mergeServers(o1.servers || [], o2.servers || []),
  }),
);

function mergeLists<T extends any[]>(compare: (o1: T[0], o2: T[0]) => boolean, merge: (o1: T[0], o2: T[0]) => T[0]) {
  return (items1: T, items2: T) => {
    return items2.reduce((items, item2) => {
      const mergeTargetIdx = items.findIndex((item: T[0]) => compare(item, item2));
      if (mergeTargetIdx > -1) {
        items[mergeTargetIdx] = merge(items[mergeTargetIdx], item2);
      } else {
        items.push(item2);
      }

      return items;
    }, items1.slice());
  };
}
