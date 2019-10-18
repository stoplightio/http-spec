import { IHttpCallbackOperation } from '@stoplight/types';
import { CallbacksObject } from 'openapi3-ts';
import { transformOas3Operation } from '../operation';

export function translateToCallbacks(callbacks?: CallbacksObject): IHttpCallbackOperation[] | undefined {
  if (!callbacks) return;

  return Object.entries(callbacks).reduce((results: IHttpCallbackOperation[], [callbackName, path2Methods]) => {
    for (const [path, method2Op] of Object.entries(path2Methods)) {
      for (const [method, op] of Object.entries(method2Op as { [key: string]: {} })) {
        results.push({
          ...transformOas3Operation({
            document: {
              openapi: '3',
              info: { title: '', version: '1' },
              paths: { [path]: { [method]: op } },
            },
            method,
            path,
          }),
          callbackName,
        });
      }
    }

    return results;
  }, []);
}
