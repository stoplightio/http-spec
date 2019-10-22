import { transformOas2Service } from '../service';

describe('oas2 service', () => {
  test('should handle non array schemes', () => {
    const retObject = transformOas2Service({
      document: {
        schemes: 2,
      } as any,
    });

    expect(retObject).toStrictEqual({
      id: '?http-service-id?',
      name: 'no-title',
      security: [],
      securitySchemes: [],
      servers: [],
      tags: []
    });
  });

  test('should accept empty title', () => {
    const retObject = transformOas2Service({
      document: {
        host: 'petstore.swagger.io',
        basePath: '/v2',
        info: {
          title: '',
        },
        schemes: ['https', 'http'],
      } as any,
    });

    expect(retObject).toStrictEqual({
      id: '?http-service-id?',
      name: '',
      title: '',
      security: [],
      securitySchemes: [],
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
      tags: []
    });
  });
});
