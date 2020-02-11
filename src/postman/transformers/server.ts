import { IServer } from '@stoplight/types/dist';
import { Url } from 'postman-collection';

export function transformServer(url: Url): IServer | undefined {
  if (!url.host) return;

  return {
    url: `${url.protocol}://${url.host.join('.')}${url.port ? `:${url.port}` : ''}`,
  };
}
