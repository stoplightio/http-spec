import { IHttpHeaderParam, IHttpOperation, IHttpOperationResponse, IMediaTypeContent, IServer } from '@stoplight/types';

const mergeHeaders = mergeLists<IHttpHeaderParam>(
  (h1, h2) => h1.name === h2.name,
  h1 => h1, // ignore header #2 if mediaTypes is equal
);

const mergeContents = mergeLists<IMediaTypeContent>(
  (c1, c2) => c1.mediaType === c2.mediaType,
  c1 => c1, // ignore content #2 if mediaTypes is equal
);

export const mergeResponses = mergeLists<IHttpOperationResponse>(
  (r1, r2) => r1.code === r2.code,
  (r1, r2) => ({
    ...r1,
    headers: mergeHeaders(r1.headers || [], r2.headers || []),
    contents: mergeContents(r1.contents || [], r2.contents || []),
  }),
);

const mergeServers = mergeLists<IServer>(
  (s1, s2) => s1.url === s2.url,
  s1 => s1, // ignore server #2 is url is equal
);

export const mergeOperations = mergeLists<IHttpOperation>(
  (o1, o2) => o1.path === o2.path && o1.method === o2.method,
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

function mergeLists<T>(compare: (o1: T, o2: T) => boolean, merge: (o1: T, o2: T) => T) {
  return (items1: T[], items2: T[]) => {
    return items2.reduce((items, item2) => {
      const mergeTargetIdx = items.findIndex(item => compare(item, item2));
      if (mergeTargetIdx > -1) {
        items[mergeTargetIdx] = merge(items[mergeTargetIdx], item2);
      } else {
        items.push(item2);
      }

      return items;
    }, items1.slice());
  };
}