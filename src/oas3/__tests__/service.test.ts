import { OpenAPIObject } from 'openapi3-ts';

import { setSkipHashing } from '../../hash';
import { transformOas3Service as _transformOas3Service } from '../service';

setSkipHashing(true);

const transformOas3Service: typeof _transformOas3Service = ({ document, ...opts }) =>
  _transformOas3Service({
    document: {
      'x-stoplight': { id: 'abc' },
      ...document,
    },
    ...opts,
  });

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
      id: 'abc',
      name: 'no-title',
      version: '',
      securitySchemes: [
        {
          id: expect.any(String),
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
      id: 'abc',
      name: 'no-title',
      version: '',
      securitySchemes: [
        {
          id: expect.any(String),
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
      id: 'abc',
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
      id: 'abc',
      name: '',
      version: '1.0',
      servers: [
        {
          id: expect.any(String),
          name: '',
          url: 'https://petstore.swagger.io/v2',
        },
        {
          id: expect.any(String),
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
      id: 'abc',
      name: 'no-title',
      version: '',
    });
  });

  it('should handle server variables', () => {
    const document: Partial<OpenAPIObject> = {
      id: 'abc',
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
      id: 'abc',
      name: 'no-title',
      version: '',
      servers: [
        {
          id: expect.any(String),
          description: 'Sample Petstore Server Https',
          url: 'https://petstore.swagger.io/v2',
          variables: {
            basePath: {
              default: 'v2',
            },
            port: {
              default: '8443',
              enum: ['8443', '443'],
            },
            username: {
              default: 'demo',
              description: 'value is assigned by the service provider',
            },
          },
        },
        {
          id: expect.any(String),
          description: 'Sample Petstore Server Http',
          url: 'http://petstore.swagger.io/v2',
        },
      ],
    });
  });

  it('should handle x-internal property', () => {
    const document: Partial<OpenAPIObject> & { 'x-internal': boolean } = {
      info: {
        title: '',
        version: '1.0',
      },
      'x-internal': true,
    };

    expect(transformOas3Service({ document })).toStrictEqual({
      id: 'abc',
      internal: true,
      name: '',
      version: '1.0',
    });
  });

  it('should filter out scopes', () => {
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
        id: 'abc',
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
        id: 'abc',
        name: '',
        version: '1.0',
        license: {
          name: 'MIT License',
          identifier: 'MIT',
        },
      });
    });
  });
  describe('x-logo support', () => {
    it('should support x-logo', () => {
      const document: Partial<OpenAPIObject> = {
        info: {
          title: 'no-title',
          version: '1.0.0',
          'x-logo': {
            altText: 'altText',
            href: 'https://stoplight.io',
            url: 'http://petstore.swagger.io/v2',
            backgroundColor: '#FFF000',
          },
        },
      };

      expect(transformOas3Service({ document })).toStrictEqual({
        id: 'abc',
        name: 'no-title',
        version: '1.0.0',
        logo: {
          altText: 'altText',
          href: 'https://stoplight.io',
          url: 'http://petstore.swagger.io/v2',
          backgroundColor: '#FFF000',
        },
      });
    });
    it('should provide default values for href and altText', () => {
      const document: Partial<OpenAPIObject> = {
        info: {
          title: 'no-title',
          version: '1.0.0',
          contact: {
            url: 'https://stoplight.io',
          },
          'x-logo': {},
        },
      };

      expect(transformOas3Service({ document })).toStrictEqual({
        id: 'abc',
        name: 'no-title',
        contact: {
          url: 'https://stoplight.io',
        },
        version: '1.0.0',
        logo: {
          altText: 'logo',
          href: 'https://stoplight.io',
        },
      });
    });
  });
});
