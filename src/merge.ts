import type {
  IHttpOperation,
  IHttpOperationRequestBody,
  IHttpParam,
  IMediaTypeContent,
  INodeExample,
  INodeExternalExample,
  IServer,
} from '@stoplight/types';
import type { JSONSchema7 as JSONSchema } from 'json-schema';

import { isEqual } from './utils';

function isExclusivelyAnyOfSchema(schema: JSONSchema): schema is { anyOf: JSONSchema[] } {
  return !!(schema.anyOf && Object.keys(schema).length === 1);
}

function mergeTwo<T>(
  mergeFunc: (first: NonNullable<T>, second: NonNullable<T>) => NonNullable<T>,
  first: T,
  second: T,
): T {
  return first && second ? mergeFunc(first!, second!) : first ? first : second;
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

  return schemas.length === 1 ? schemas[0] : { anyOf: schemas };
}

function mergeParams<T extends IHttpParam>(params1: T[], params2: T[]): T[] {
  const params1OnlyAndCommon = params1.map(p1 => {
    const p2 = params2.find(p2 => p2.name.toLowerCase() === p1.name.toLowerCase());

    if (p2) {
      return {
        ...p2,
        ...p1,
        required: p1.required && p2.required,
        schema: mergeTwo(mergeSchemas, p1.schema, p2.schema),
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
      id: c1.id,
      mediaType: c1.mediaType,
      schema: mergeTwo(mergeSchemas, c1.schema, c2.schema),
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
    id: b1.id,
    description: [b1.description, b2.description].filter(Boolean).join('; ') || undefined,
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
      path: mergeTwo(mergeParams, o1.request?.path, o2.request?.path),
      query: mergeTwo(mergeParams, o1.request?.query, o2.request?.query),
      body: mergeTwo(mergeRequestBodies, o1.request?.body, o2.request?.body),
      headers: mergeTwo(mergeParams, o1.request?.headers, o2.request?.headers),
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
