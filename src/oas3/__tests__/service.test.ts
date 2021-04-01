import { OpenAPIObject } from 'openapi3-ts';

import { transformOas3Service } from '../service';

describe('oas3 service', () => {
  it('should handle non object security objects', () => {
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

    expect(transformOas3Service({ document })).toStrictEqual({
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

  it.each<Partial<OpenAPIObject>>([
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
    expect(transformOas3Service({ document })).toStrictEqual({
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

  it('should handle non array servers', () => {
    const document: Partial<OpenAPIObject> = {
      servers: 2 as any,
    };

    expect(transformOas3Service({ document })).toStrictEqual({
      id: '?http-service-id?',
      name: 'no-title',
      version: '',
    });
  });

  it('should accept empty title', () => {
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

    expect(transformOas3Service({ document })).toStrictEqual({
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

  it('should handle invalid document securities gracefully', () => {
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

  it('should handle server variables', () => {
    const document: Partial<OpenAPIObject> = {
      id: '?http-service-id?',
      name: '',
      version: '1.0',
      servers: [
        {
          url: 'https://petstore.swagger.io/v2',
          description: 'Sample Petstore Server Https',
          variables: {
            username: {
              default: 'demo',
              description: 'value is assigned by the service provider',
            },
            port: {
              enum: [8443, 443],
              default: 8443,
            },
            basePath: {
              default: 'v2',
            },
          },
        },
        {
          url: 'http://petstore.swagger.io/v2',
          description: 'Sample Petstore Server Http',
        },
      ],
    };

    expect(transformOas3Service({ document })).toStrictEqual({
      id: '?http-service-id?',
      name: 'no-title',
      version: '',
      servers: [
        {
          description: 'Sample Petstore Server Https',
          name: '',
          url: 'https://petstore.swagger.io/v2',
          variables: {
            basePath: {
              default: 'v2',
              description: void 0,
              enum: void 0,
            },
            port: {
              default: '8443',
              description: void 0,
              enum: ['8443', '443'],
            },
            username: {
              default: 'demo',
              description: 'value is assigned by the service provider',
              enum: void 0,
            },
          },
        },
        {
          description: 'Sample Petstore Server Http',
          name: '',
          url: 'http://petstore.swagger.io/v2',
        },
      ],
    });
  });

  it('should filter out out scopes', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3.0.0',
      components: {
        schemas: {},
        securitySchemes: {
          'API Key': {
            type: 'oauth2',
            flows: {
              implicit: {
                authorizationUrl: '',
                refreshUrl: '',
                scopes: {
                  scope_1: '',
                  scope_2: '',
                },
              },
            },
          },
        },
      },
      security: [{ 'API Key': ['scope_1'] }],
    };

    const transformed = transformOas3Service({ document });
    expect(transformed).toHaveProperty(['security', 0, 'flows', 'implicit', 'scopes'], { scope_1: '' });
  });

  describe('OAS 3.1 support', () => {
    it('should support info.summary', () => {
      const document: Partial<OpenAPIObject> = {
        info: {
          title: '',
          version: '1.0',
          summary: 'Very cool API',
        },
      };

      expect(transformOas3Service({ document })).toEqual({
        id: '?http-service-id?',
        name: '',
        version: '1.0',
        summary: 'Very cool API',
      });
    });

    it('should support info.license.identifier', () => {
      const document: Partial<OpenAPIObject> = {
        info: {
          title: '',
          version: '1.0',
          license: {
            name: 'MIT License',
            identifier: 'MIT',
          },
        },
      };

      expect(transformOas3Service({ document })).toEqual({
        id: '?http-service-id?',
        name: '',
        version: '1.0',
        license: {
          name: 'MIT License',
          identifier: 'MIT',
        },
      });
    });
  });
});
