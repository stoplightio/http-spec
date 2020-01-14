import { OpenAPIObject } from 'openapi3-ts';
import { transformOas3Service } from '../service';

describe('oas3 service', () => {
  test('should handle non object security objects', () => {
    const document: Partial<OpenAPIObject> = {
      components: {
        securitySchemes: {
          t1: { type: 'apiKey' },
          t2: 4,
          t3: 2,
          t4: undefined,
        } as any,
      },
    };

    expect(
      transformOas3Service({
        document,
      }),
    ).toStrictEqual({
      id: '?http-service-id?',
      name: 'no-title',
      version: '',
      securitySchemes: [
        {
          key: 't1',
          type: 'apiKey',
          in: undefined,
          name: undefined,
        },
      ],
    });
  });

  test.each<Partial<OpenAPIObject>>([
    {
      components: {
        securitySchemes: {
          t1: { type: 'oauth2' },
        },
      } as Partial<OpenAPIObject>,
    },
    {
      components: {
        securitySchemes: {
          t1: { type: 'oauth2', flows: 'invalid' },
        },
      },
    },
    {
      components: {
        securitySchemes: {
          t1: { type: 'oauth2', flows: null },
        },
      },
    },
    {
      components: {
        securitySchemes: {
          t1: { type: 'oauth2', flows: 999 },
        },
      },
    },
    {
      components: {
        securitySchemes: {
          t1: { type: 'oauth2', flows: [] },
        },
      },
    },
  ])('should handle lacking flows for oauth2 security object', document => {
    expect(
      transformOas3Service({
        document,
      }),
    ).toStrictEqual({
      id: '?http-service-id?',
      name: 'no-title',
      version: '',
      securitySchemes: [
        {
          flows: {},
          key: 't1',
          type: 'oauth2',
        },
      ],
    });
  });

  test('should handle non array servers', () => {
    const document: Partial<OpenAPIObject> = {
      servers: 2 as any,
    };

    expect(
      transformOas3Service({
        document,
      }),
    ).toStrictEqual({
      id: '?http-service-id?',
      name: 'no-title',
      version: '',
    });
  });

  test('should accept empty title', () => {
    const document: Partial<OpenAPIObject> = {
      info: {
        title: '',
        version: '1.0',
      },
      servers: [
        {
          url: 'https://petstore.swagger.io/v2',
        },
        {
          url: 'http://petstore.swagger.io/v2',
        },
      ],
    };

    expect(
      transformOas3Service({
        document,
      }),
    ).toStrictEqual({
      id: '?http-service-id?',
      name: '',
      version: '1.0',
      servers: [
        {
          description: void 0,
          name: '',
          url: 'https://petstore.swagger.io/v2',
        },
        {
          description: void 0,
          name: '',
          url: 'http://petstore.swagger.io/v2',
        },
      ],
    });
  });

  test('should handle invalid document securities gracefully', () => {
    const document: Partial<OpenAPIObject> = {
      components: {
        securitySchemes: {},
      },
      security: ['api-key'] as any,
    };

    expect(transformOas3Service({ document })).toStrictEqual({
      id: '?http-service-id?',
      name: 'no-title',
      version: '',
    });
  });
});
