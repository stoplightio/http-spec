import { IServer } from '@stoplight/types';
import { Url } from 'postman-collection';
import * as urijs from 'urijs';

export function transformServer(url: Url): IServer | undefined {
  const origin = urijs(url.toString()).origin();
  return origin ? { url: origin } : undefined;
}
