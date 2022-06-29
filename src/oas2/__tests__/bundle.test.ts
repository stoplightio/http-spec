import * as fs from 'fs';
import * as path from 'path';

import { bundleOas2Service } from '../service';

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
          id: 'c911d0f53d100',
          method: 'patch',
          path: '/users/{userId}',
          extensions: {},
          request: {
            body: {
              id: '5331ff8ad9369',
              contents: [
                {
                  id: 'cf10c8e681da1',
                  examples: [],
                  mediaType: 'application/json',
                  schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    'x-stoplight': {
                      id: 'dbc0f9871a94e',
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
          id: '551bee27265ba',
          method: 'put',
          path: '/users/{userId}',
          extensions: {},
          request: {
            body: {
              id: 'a9a74db98e417',
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
          id: '71b60791196bf',
          method: 'post',
          path: '/users/{userId}',
          extensions: {},
          request: {
            body: {
              id: '9b5d65cfbc4fd',
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
