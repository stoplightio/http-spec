import * as fs from 'fs';
import * as path from 'path';

import { setSkipHashing } from '../../hash';
import { bundleOas2Service } from '../service';

setSkipHashing(true);

describe('bundleOas2Service', () => {
  it('should not bundle shared requestBodies', () => {
    expect(
      bundleOas2Service({
        document: {
          'x-stoplight': {
            id: 'abc',
          },
          swagger: '2.0',
          paths: {
            '/users/{userId}': {
              patch: {
                consumes: ['application/json'],
                parameters: [
                  {
                    $ref: '#/parameters/ids',
                  },
                  {
                    $ref: '#/parameters/email',
                  },
                ],
              },
              put: {
                parameters: [
                  {
                    $ref: '#/parameters/ids',
                  },
                ],
              },
              post: {
                parameters: [
                  {
                    $ref: '#/parameters/email',
                  },
                ],
              },
            },
          },
          parameters: {
            ids: {
              in: 'formData',
              name: 'ids',
              type: 'array',
              items: {
                type: 'number',
              },
              required: true,
              maxItems: 10,
              minItems: 1,
            },
            email: {
              in: 'body',
              name: 'email',
              required: true,
              schema: {
                format: 'e-mail',
              },
            },
          },
        },
      }),
    ).toStrictEqual({
      id: 'abc',
      name: 'no-title',
      version: '',
      operations: [
        {
          id: 'http_operation-abc-patch-/users/{}',
          method: 'patch',
          path: '/users/{userId}',
          extensions: {},
          request: {
            body: {
              id: 'http_request_body-abc-application/json',
              contents: [
                {
                  id: 'http_media-http_request_body-abc-application/json-application/json',
                  examples: [],
                  mediaType: 'application/json',
                  schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    'x-stoplight': {
                      id: 'schema-http_media-http_request_body-abc-application/json-application/json-',
                    },
                    format: 'e-mail',
                  },
                },
              ],
              required: true,
            },
            cookie: [],
            headers: [],
            path: [],
            query: [],
          },
          responses: [],
          security: [],
          servers: [],
          tags: [],
        },
        {
          id: 'http_operation-abc-put-/users/{}',
          method: 'put',
          path: '/users/{userId}',
          extensions: {},
          request: {
            body: {
              id: 'http_request_body-http_operation-abc-put-/users/{}',
              contents: [],
            },
            cookie: [],
            headers: [],
            path: [],
            query: [],
          },
          responses: [],
          security: [],
          servers: [],
          tags: [],
        },
        {
          id: 'http_operation-abc-post-/users/{}',
          method: 'post',
          path: '/users/{userId}',
          extensions: {},
          request: {
            body: {
              id: 'http_request_body-abc',
              contents: [],
              required: true,
            },
            cookie: [],
            headers: [],
            path: [],
            query: [],
          },
          responses: [],
          security: [],
          servers: [],
          tags: [],
        },
      ],
      components: {
        cookie: [],
        examples: [],
        header: [],
        path: [],
        query: [],
        responses: [],
        requestBodies: [],
        schemas: [],
        securitySchemes: [],
      },
    });
  });

  it.each(fs.readdirSync(path.join(__dirname, './__fixtures__')))(
    'given %s, should generate valid output',
    async name => {
      const document = JSON.parse(
        await fs.promises.readFile(path.join(__dirname, './__fixtures__', name, 'input.json'), 'utf8'),
      );
      const { default: output } = await import(`./__fixtures__/${name}/bundled`);

      expect(bundleOas2Service({ document })).toEqual(output);
    },
  );
});
