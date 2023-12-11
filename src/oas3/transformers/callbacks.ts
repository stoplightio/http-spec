import type { IHttpCallbackOperation, IHttpKeyedReference } from '@stoplight/types';
import type { OpenAPIObject } from 'openapi3-ts';

import { createContext } from '../../oas/context';
import { isReferenceObject } from '../../oas/guards';
import { OPERATION_CONFIG } from '../../oas/operation';
import { entries } from '../../utils';
import { transformOas3Operation } from '../operation';
import type { Oas3TranslateFunction } from '../types';

export const translateToCallbacks: Oas3TranslateFunction<
  [callbacks: unknown],
  (IHttpCallbackOperation | IHttpKeyedReference)[] | undefined
> = function (callbacks) {
  const callbackEntries = entries(callbacks);
  if (!callbackEntries.length) return;

  return callbackEntries.reduce(
    (results: (IHttpCallbackOperation | IHttpKeyedReference)[], [callbackName, path2Methods]) => {
      if (isReferenceObject(path2Methods)) {
        results.push({ key: callbackName, ...path2Methods });
      }
      for (const [path, method2Op] of entries(path2Methods)) {
        for (const [method, op] of entries(method2Op as { [key: string]: {} })) {
          const document: Partial<OpenAPIObject> = {
            openapi: '3',
            info: { title: '', version: '1' },
            paths: { [path]: { [method]: op } },
          };

          const ctx = createContext(document);
          ctx.context = 'callback';
          Object.assign(ctx.ids, this.ids);
          ctx.ids.operation = this.generateId.httpCallbackOperation({ parentId: this.ids.service, method, path });
          results.push({
            ...transformOas3Operation({
              document,
              method,
              name: path,
              config: OPERATION_CONFIG,
              ctx,
            }),
            key: callbackName,
          });
        }
      }

      return results;
    },
    [],
  );
};
