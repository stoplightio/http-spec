import type { IHttpCallbackOperation } from '@stoplight/types';
import type { OpenAPIObject } from 'openapi3-ts';

import { entries } from '../../utils';
import { transformOas3Operation } from '../operation';
import type { Oas3TranslateFunction } from '../types';

export const translateToCallbacks: Oas3TranslateFunction<[callbacks: unknown], IHttpCallbackOperation[] | undefined> =
  function (callbacks) {
    const callbackEntries = entries(callbacks);
    if (!callbackEntries.length) return;

    return callbackEntries.reduce((results: IHttpCallbackOperation[], [callbackName, path2Methods]) => {
      for (const [path, method2Op] of entries(path2Methods)) {
        for (const [method, op] of entries(method2Op as { [key: string]: {} })) {
          const document: Partial<OpenAPIObject> = {
            openapi: '3',
            info: { title: '', version: '1' },
            paths: { [path]: { [method]: op } },
          };

          results.push({
            ...transformOas3Operation({
              document,
              method,
              path,
            }),
            callbackName,
          });
        }
      }

      return results;
    }, []);
  };
