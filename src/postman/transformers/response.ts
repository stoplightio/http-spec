import { HttpParamStyles, IHttpHeaderParam, IHttpOperationResponse } from '@stoplight/types';
import { Cookie, Response } from 'postman-collection';

import { generateId } from '../id';
import { transformDescriptionDefinition } from '../util';
import { transformHeader, transformRawBody } from './params';

export function transformResponse(response: Response): IHttpOperationResponse {
  const headers = response.headers.map(transformHeader);
  const mediaType = response.headers.get('content-type');

  return {
    id: generateId(),
    code: String(response.code),
    description: response.description && transformDescriptionDefinition(response.description),
    headers: headers.concat(response.cookies.map(transformCookie).filter((c: Cookie) => c)),
    contents: mediaType && response.body ? [transformRawBody(response.body, mediaType)] : undefined,
  };
}

function transformCookie(cookie: Cookie): IHttpHeaderParam | undefined {
  const params = [`${cookie.name || ''}=${cookie.value || ''}`];
  const expires = cookie.expires;

  if (expires) params.push(`Expires=${(isDate(expires) ? expires : new Date(expires * 1000)).toUTCString()}`);
  if (cookie.maxAge !== undefined) params.push(`Max-Age=${cookie.maxAge}`);
  if (cookie.domain) params.push(`Domain=${cookie.domain}`);
  if (cookie.path) params.push(`Path=${cookie.path}`);
  if (cookie.secure) params.push(`Secure`);
  if (cookie.httpOnly) params.push(`HttpOnly`);
  if (cookie.extensions) params.push(...cookie.extensions.map(({ key, value }) => `${key}=${value}`));

  return {
    id: generateId(),
    name: 'set-cookie',
    examples: [
      {
        id: generateId(),
        key: 'default',
        value: params.join('; '),
      },
    ],
    style: HttpParamStyles.Simple,
  };
}

function isDate(date: Date | number): date is Date {
  return date instanceof Date;
}
