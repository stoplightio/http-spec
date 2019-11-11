import { transformOas3Service } from '../service';

describe('oas3 service', () => {
  test('should handle non object security objects', () => {
    const retObject = transformOas3Service({
      document: {
        components: {
          securitySchemes: {
            t1: {},
            t2: 4,
            t3: 2,
            t4: undefined,
          },
        },
      } as any,
    });

    expect(retObject.securitySchemes).toHaveLength(1);
  });

  test('should handle non array servers', () => {
    const retObject = transformOas3Service({
      document: {
        servers: 2,
      } as any,
    });

    expect(retObject).toStrictEqual({
      id: '?http-service-id?',
      name: 'no-title',
      security: [],
      securitySchemes: [],
      servers: [],
      tags: [],
    });
  });

  test('should accept empty title', () => {
    const retObject = transformOas3Service({
      document: {
        info: {
          title: '',
        },
        servers: [
          {
            url: 'https://petstore.swagger.io/v2',
          },
          {
            url: 'http://petstore.swagger.io/v2',
          },
        ],
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
      tags: [],
    });
  });
});
