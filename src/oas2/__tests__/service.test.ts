import { OpenAPIObject } from 'openapi3-ts';
import { Spec } from 'swagger-schema-official';

import { Fragment } from '../../types';
import { transformOas2Service } from '../service';

describe('oas2 service', () => {
  it('should handle non array schemes', () => {
    const document: Partial<Spec> & Fragment = {
      'x-stoplight': { id: 'def' },
      schemes: 2 as any,
    };

    expect(
      transformOas2Service({
        document,
      }),
    ).toStrictEqual({
      id: 'def',
      name: 'no-title',
      version: '',
    });
  });

  it('should accept empty title', () => {
    const document: Partial<Spec> & Fragment = {
      'x-stoplight': { id: 'abc' },
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
    const document: Partial<Spec> & Fragment = {
      'x-stoplight': { id: 'abc' },
      securityDefinitions: {},
      security: ['API-Key'] as any,
    };

    expect(transformOas2Service({ document })).toStrictEqual({
      id: 'abc',
      name: 'no-title',
      version: '',
    });
  });

  it('filters out scopes', () => {
    const document: Partial<Spec> & Fragment = {
      'x-stoplight': { id: 'def' },
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

  it('should handle x-internal property', () => {
    const document: Partial<Spec> & Fragment & { 'x-internal': boolean } = {
      'x-stoplight': { id: 'abc' },
      info: {
        title: '',
        version: '1.0',
      },
      'x-internal': true,
    };

    expect(
      transformOas2Service({
        document,
      }),
    ).toStrictEqual({
      id: 'abc',
      name: '',
      version: '1.0',
      internal: true,
    });
  });
  describe('x-logo support', () => {
    it('should support x-logo', () => {
      const document: Partial<OpenAPIObject> = {
        'x-stoplight': { id: 'abc' },
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

      expect(transformOas2Service({ document })).toStrictEqual({
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
        'x-stoplight': { id: 'abc' },
        info: {
          title: 'no-title',
          version: '1.0.0',
          contact: {
            url: 'https://stoplight.io',
          },
          'x-logo': {},
        },
      };

      expect(transformOas2Service({ document })).toStrictEqual({
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
