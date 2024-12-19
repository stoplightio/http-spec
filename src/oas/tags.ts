import { isPlainObject } from '@stoplight/json';
import type { INodeTag, Optional } from '@stoplight/types';
import { pickBy } from 'lodash';

import { withContext } from '../context';
import { isNonNullable, isSerializablePrimitive, isString } from '../guards';
import type { ArrayCallbackParameters, Fragment, TranslateFunction } from '../types';
import { getExtensions } from './accessors';
import { toExternalDocs } from './externalDocs';

const translateTag = withContext<TranslateFunction<Fragment, ArrayCallbackParameters<unknown>, Optional<INodeTag>>>(
  function (tag) {
    if (tag === null || !isSerializablePrimitive(tag)) return;

    const name = String(tag);

    return {
      id: this.generateId.tag({ name }),
      name,
    };
  },
);

/**
 * translate a tag _definition_ to http-spec (e.g., at the top level of an
 * OpenAPI document)
 */
export const translateTagDefinition: TranslateFunction<
  Fragment,
  ArrayCallbackParameters<unknown>,
  Optional<INodeTag>
> = function (tag, ...params) {
  if (!isPlainObject(tag)) return;

  const translatedTag = translateTag.call(this, tag.name, ...params);

  if (!translatedTag) return;

  const extensions = getExtensions(tag);

  return {
    ...translatedTag,

    ...pickBy(
      {
        description: tag.description,
      },
      isString,
    ),

    ...toExternalDocs(tag.externalDocs),
    extensions,
  };
};

/**
 * translate a _reference_ to a tag to http-spec (e.g., at the operation level
 * of an OpenAPI document)
 */
export const translateToTags: TranslateFunction<Fragment, [tags: unknown], INodeTag[]> = function (tags) {
  return Array.isArray(tags) ? tags.map(translateTag, this).filter(isNonNullable) : [];
};
