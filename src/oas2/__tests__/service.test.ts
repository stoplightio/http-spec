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
    const document: Partial<Spec> = {
      securityDefinitions: {},
      security: ['API-Key'] as any,
    };

    expect(transformOas2Service({ document })).toStrictEqual({
      id: '?http-service-id?',
      name: 'no-title',
      version: '',
    });
  });
});
