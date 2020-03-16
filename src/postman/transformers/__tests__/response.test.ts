import { Response } from 'postman-collection';
import { transformResponse } from '../response';

describe('transformResponse()', () => {
  describe('media type is defined', () => {
    it('produces response with content', () => {
      expect(
        transformResponse(
          new Response({
            code: 200,
            header: [{ key: 'Content-type', value: 'application/json' }],
            responseTime: 100,
            body: '{"I\'m a JSON": "Jieeeet!"}',
            cookie: [
              {
                key: 'eat',
                value: 'functions',
                domain: '.example.com',
                path: '/',
              },
            ],
          }),
        ),
      ).toEqual({
        code: '200',
        contents: [
          {
            examples: [
              {
                key: 'default',
                value: {
                  "I'm a JSON": 'Jieeeet!',
                },
              },
            ],
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-04/schema#',
              description: '',
              properties: {
                "I'm a JSON": {
                  minLength: 1,
                  type: 'string',
                },
              },
              required: ["I'm a JSON"],
              type: 'object',
            },
          },
        ],
        description: undefined,
        headers: [
          {
            examples: [
              {
                key: 'default',
                value: 'application/json',
              },
            ],
            name: 'content-type',
            required: true,
            schema: {
              type: 'string',
            },
            style: 'simple',
          },
          {
            examples: [
              {
                key: 'default',
                value: 'eat=functions; Domain=.example.com; Path=/',
              },
            ],
            name: 'set-cookie',
            style: 'simple',
          },
        ],
      });
    });
  });

  describe('media type is not defined', () => {
    it('produces response without content', () => {
      expect(
        transformResponse(
          new Response({
            code: 200,
            responseTime: 100,
            body: '{"I\'m a JSON": "Jieeeet!"}',
          }),
        ),
      ).toEqual({
        code: '200',
        contents: undefined,
        description: undefined,
        headers: [],
      });
    });
  });

  describe('description is defined', () => {
    it('produces response with description', () => {
      expect(
        transformResponse(
          new Response({
            code: 200,
            responseTime: 100,
            body: '{"I\'m a JSON": "Jieeeet!"}',
            description: { content: 'Test' },
          }),
        ),
      ).toEqual({
        code: '200',
        contents: undefined,
        description: 'Test',
        headers: [],
      });
    });
  });

  describe('cookies are set', () => {
    describe('all standard parameters are set', () => {
      it('creates correct Set-Cookie header', () => {
        expect(
          transformResponse(
            new Response({
              code: 200,
              cookie: [
                {
                  key: 'eat',
                  value: 'functions',
                  expires: new Date(0),
                  domain: 'example.com',
                  path: '/',
                  httpOnly: true,
                  maxAge: 300,
                  secure: true,
                },
              ],
              responseTime: 100,
            }),
          ),
        ).toEqual({
          code: '200',
          contents: undefined,
          description: undefined,
          headers: [
            {
              examples: [
                {
                  key: 'default',
                  value:
                    'eat=functions; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=300; Domain=example.com; Path=/; Secure; HttpOnly',
                },
              ],
              name: 'set-cookie',
              style: 'simple',
            },
          ],
        });
      });
    });

    describe('minimal parameters set is defined', () => {
      it('creates correct Set-Cookie header', () => {
        expect(
          transformResponse(
            new Response({
              code: 200,
              cookie: [
                {
                  key: 'eat',
                  value: 'functions',
                  domain: 'example.com',
                  path: '/',
                },
              ],
              responseTime: 100,
            }),
          ),
        ).toEqual({
          code: '200',
          contents: undefined,
          description: undefined,
          headers: [
            {
              examples: [
                {
                  key: 'default',
                  value: 'eat=functions; Domain=example.com; Path=/',
                },
              ],
              name: 'set-cookie',
              style: 'simple',
            },
          ],
        });
      });
    });

    describe('neither name nor value is defined', () => {
      it('preserves rest of params', () => {
        expect(
          transformResponse(
            new Response({
              code: 200,
              cookie: [
                {
                  domain: 'example.com',
                  path: '/',
                },
              ],
              responseTime: 100,
            }),
          ),
        ).toEqual({
          code: '200',
          contents: undefined,
          description: undefined,
          headers: [
            {
              examples: [
                {
                  key: 'default',
                  value: '=; Domain=example.com; Path=/',
                },
              ],
              name: 'set-cookie',
              style: 'simple',
            },
          ],
        });
      });
    });

    describe('extensions are defined', () => {
      it('preserves rest of params', () => {
        expect(
          transformResponse(
            new Response({
              code: 200,
              cookie: [
                {
                  key: 'eat',
                  value: 'functions',
                  domain: 'example.com',
                  path: '/',
                  extensions: [
                    { key: 'a', value: 'p' },
                    { key: 'u', value: 'd' },
                  ],
                },
              ],
              responseTime: 100,
            }),
          ),
        ).toEqual({
          code: '200',
          contents: undefined,
          description: undefined,
          headers: [
            {
              examples: [
                {
                  key: 'default',
                  value: 'eat=functions; Domain=example.com; Path=/; a=p; u=d',
                },
              ],
              name: 'set-cookie',
              style: 'simple',
            },
          ],
        });
      });
    });
  });
});
