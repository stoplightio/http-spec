import { Spec } from 'swagger-schema-official';

import { transformOas2Service } from '../service';

describe('oas2 service', () => {
  it('should handle non array schemes', () => {
    const document: Partial<Spec> = {
      schemes: 2 as any,
    };

    expect(
      transformOas2Service({
        document,
      }),
    ).toStrictEqual({
      id: '?http-service-id?',
      name: 'no-title',
      version: '',
      servers: [],
    });
  });

  it('should accept empty title', () => {
    const document: Partial<Spec> = {
      host: 'petstore.swagger.io',
      basePath: '/v2',
      info: {
        title: '',
        version: '1.0',
      },
      schemes: ['https', 'http'],
    };

    expect(
      transformOas2Service({
        document,
      }),
    ).toStrictEqual({
      id: '?http-service-id?',
      name: '',
      version: '1.0',
      servers: [
        {
          id: 'server-0',
          url: 'https://petstore.swagger.io/v2',
        },
        {
          id: 'server-1',
          url: 'http://petstore.swagger.io/v2',
        },
      ],
    });
  });

  it('should handle invalid document securities gracefully', () => {
    const document: Partial<Spec> = {
      securityDefinitions: {},
      security: ['API-Key'] as any,
    };

    expect(transformOas2Service({ document })).toStrictEqual({
      id: '?http-service-id?',
      name: 'no-title',
      servers: [],
      version: '',
    });
  });

  it('filters out scopes', () => {
    const document: Partial<Spec> = {
      swagger: '2.0',
      securityDefinitions: {
        'API Key': {
          type: 'oauth2',
          flow: 'implicit',
          authorizationUrl: '',
          scopes: {
            scope_1: '',
            scope_2: '',
          },
        },
      },
      security: [{ 'API Key': ['scope_1'] }],
    };

    const transformed = transformOas2Service({ document });
    expect(transformed).toHaveProperty(['security', 0, 'flows', 'implicit', 'scopes'], { scope_1: '' });
  });
});
