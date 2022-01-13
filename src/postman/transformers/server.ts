import { IServer } from '@stoplight/types';
import { Url } from 'postman-collection';

export function transformServer(url: Url): IServer | undefined {
  try {
    const origin = new URL(url.toString()).origin;
    return origin ? { url: origin } : undefined;
  } catch {
    return undefined;
  }
}
