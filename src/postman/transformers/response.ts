import { HttpParamStyles, IHttpHeaderParam, IHttpOperationResponse } from '@stoplight/types';
import { Cookie, Response } from 'postman-collection';
import { transformDescriptionDefinition } from '../util';
import { transformHeader, transformRawBody } from './params';

export function transformResponse(response: Response): IHttpOperationResponse {
  const headers = response.headers.map(transformHeader);
  const mediaType = response.headers.get('content-type');

  return {
    code: String(response.code),
    description: response.description && transformDescriptionDefinition(response.description),
    headers: headers.concat(response.cookies.map(transformCookie).filter((c: Cookie) => c)),
    contents: mediaType && response.body ? [transformRawBody(response.body, mediaType)] : undefined,
  };
}

function transformCookie(cookie: Cookie): IHttpHeaderParam | undefined {
  const params = [`${cookie.name || ''}=${cookie.value || ''}`];

  if (cookie.expires) params.push(`Expires=${cookie.expires.toUTCString()}`);
  if (cookie.maxAge !== undefined) params.push(`Max-Age=${cookie.maxAge}`);
  if (cookie.domain) params.push(`Domain=${cookie.domain}`);
  if (cookie.path) params.push(`Path=${cookie.path}`);
  if (cookie.secure) params.push(`Secure`);
  if (cookie.httpOnly) params.push(`HttpOnly`);
  if (cookie.extensions) params.push(...cookie.extensions.map(({ key, value }) => `${key}=${value}`));

  return {
    name: 'set-cookie',
    examples: [
      {
        key: 'default',
        value: params.join('; '),
      },
    ],
    style: HttpParamStyles.Simple,
  };
}
