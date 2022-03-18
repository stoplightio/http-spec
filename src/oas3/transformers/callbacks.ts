import type { IHttpCallbackOperation } from '@stoplight/types';
import type { OpenAPIObject } from 'openapi3-ts';

import { withJsonPath } from '../../context';
import { entries } from '../../utils';
import { transformOas3Operation } from '../operation';
import { Oas3TranslateFunction } from '../types';

export const translateToCallbacks = withJsonPath<
  Oas3TranslateFunction<[callbacks: unknown], IHttpCallbackOperation[] | undefined>
  >(function (callbacks) {
  const callbackEntries = entries(callbacks);
  if (!callbackEntries.length) return;

  this.state.enter('callbacks');
  const pathLength = this.state.path.length;

  return callbackEntries.reduce((results: IHttpCallbackOperation[], [callbackName, path2Methods]) => {
    for (const [opPath, method2Op] of entries(path2Methods)) {
      for (const [method, op] of entries(method2Op as { [key: string]: {} })) {
        const document: Partial<OpenAPIObject> = {
          ...(this.state.document as any),
          openapi: '3',
          info: { title: '', version: '1' },
          paths: { [opPath]: { [method]: op } },
        };

        results.push({
          ...transformOas3Operation({
            document,
            method,
            path: opPath,
            generateId: () => {
              this.state.enter(callbackName);
              const id = this.generateId('callback');
              this.state.exit(pathLength);
              return id;
            },
          }),
          callbackName,
        });
      }
    }

    return results;
  }, []);
});
