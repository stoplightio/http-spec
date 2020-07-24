import {
  IHttpHeaderParam,
  IHttpOperation,
  IMediaTypeContent,
  INodeExample,
  INodeExternalExample,
  IServer,
} from '@stoplight/types';
import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
import { isEqual } from 'lodash';

type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;

function mergeSchemas(schema1: JSONSchema, schema2: JSONSchema): JSONSchema {
  const schemas = (schema2.anyOf && Object.keys(schema2).length === 1
    ? (schema2.anyOf as JSONSchema[])
    : [schema2]
  ).reduce<Array<JSONSchema>>(
    (schemas, schema) => {
      if (!schemas.find(s => isEqual(s, schema))) {
        schemas.push(schema);
      }
      return schemas;
    },
    schema1.anyOf && Object.keys(schema1).length === 1 ? (schema1.anyOf as JSONSchema[]) : [schema1],
  );

  return schemas.length === 1 ? schemas[0] : { anyOf: schemas as any };
}

function mergeHeaders(headers1: IHttpHeaderParam[], headers2: IHttpHeaderParam[]): IHttpHeaderParam[] {
  const headers1OnlyAndCommon = headers1.map(h1 => {
    const h2 = headers2.find(h2 => h2.name.toLowerCase() === h1.name.toLowerCase());

    if (h2) {
      return {
        ...h2,
        ...h1,
        required: true,
        schema: h1.schema && h2.schema ? mergeSchemas(h1.schema, h2.schema) : h1.schema ? h1.schema : h2.schema,
      };
    } else {
      return {
        ...h1,
        required: false,
      };
    }
  });

  const headers2Only = headers2
    .filter(h2 => !headers1.find(h1 => h1.name.toLowerCase() === h2.name.toLowerCase()))
    .map(h2 => ({ ...h2, required: false }));

  return [...headers1OnlyAndCommon, ...headers2Only];
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
    headers: mergeHeaders(r1.headers || [], r2.headers || []),
    contents: mergeContents(r1.contents || [], r2.contents || []),
  }),
);

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
      headers: mergeHeaders(o1.request?.headers || [], o2.request?.headers || []),
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
