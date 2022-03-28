import type { IServer } from '@stoplight/types';
import type { Url } from 'postman-collection';

import { generateId } from '../id';

export function transformServer(url: Url): IServer | undefined {
  try {
    const origin = new URL(url.toString()).origin;
    return origin ? { id: generateId(), url: origin } : undefined;
  } catch {
    return undefined;
  }
}
