import { INodeTag } from '@stoplight/types';

export function translateToTags(tags: string[]): INodeTag[] {
  return tags.map(tag => ({ name: tag }));
}
