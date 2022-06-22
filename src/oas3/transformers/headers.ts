import { isPlainObject } from '@stoplight/json';
import { HttpParamStyles, IHttpEncoding, IHttpHeaderParam, Optional, Reference } from '@stoplight/types';
import pickBy = require('lodash.pickby');

import { withContext } from '../../context';
import { isBoolean, isNonNullable, isString } from '../../guards';
import { isReferenceObject } from '../../oas/guards';
import { translateSchemaObject } from '../../oas/transformers';
import { translateToDefaultExample } from '../../oas/transformers/examples';
import { entries } from '../../utils';
import { isHeaderObject } from '../guards';
import { Oas3TranslateFunction } from '../types';
import { translateToExample } from './examples';

export const translateHeaderObject = withContext<
  Oas3TranslateFunction<
    [[name: string, headerObject: unknown]],
    Optional<IHttpHeaderParam<true> | (Pick<IHttpHeaderParam<true>, 'name'> & Reference)>
  >
>(function ([name, unresolvedHeaderObject]) {
  const maybeHeaderObject = this.maybeResolveLocalRef(unresolvedHeaderObject);

  if (isReferenceObject(maybeHeaderObject)) {
    (maybeHeaderObject as Pick<IHttpHeaderParam<true>, 'name'> & Reference).name = name;
    return maybeHeaderObject as Pick<IHttpHeaderParam<true>, 'name'> & Reference;
  }

  if (!isPlainObject(maybeHeaderObject)) return;

  const id = this.generateId.httpHeader({ nameOrKey: name });

  if (!isHeaderObject(maybeHeaderObject)) {
    return {
      id,
      encodings: [],
      examples: [],
      name,
      style: HttpParamStyles.Simple,
    };
  }

  const { content: contentObject } = maybeHeaderObject;

  const contentValue = isPlainObject(contentObject) ? Object.values(contentObject)[0] : null;

  const baseContent: IHttpHeaderParam = {
    id,
    name,
    style: HttpParamStyles.Simple,

    ...pickBy(
      {
        schema: isPlainObject(maybeHeaderObject.schema)
          ? translateSchemaObject.call(this, maybeHeaderObject.schema)
          : null,
        content: maybeHeaderObject.content,
      },
      isNonNullable,
    ),

    ...pickBy(
      {
        description: maybeHeaderObject.description,
      },
      isString,
    ),

    ...pickBy(
      {
        allowEmptyValue: maybeHeaderObject.allowEmptyValue,
        allowReserved: maybeHeaderObject.allowReserved,
        explode: maybeHeaderObject.explode,
        required: maybeHeaderObject.required,
        deprecated: maybeHeaderObject.deprecated,
      },
      isBoolean,
    ),
  };

  const examples: IHttpHeaderParam<true>['examples'] = [];
  const encodings: IHttpEncoding<true>[] = [];

  if (isPlainObject(contentValue)) {
    examples.push(...entries(contentValue.examples).map(translateToExample, this).filter(isNonNullable));

    if (isPlainObject(contentValue.encoding)) {
      encodings.push(...(Object.values(contentValue.encoding) as IHttpEncoding<true>[]));
    }

    if ('example' in contentValue) {
      examples.push(translateToDefaultExample.call(this, '__default_content', contentValue.example));
    }
  }

  examples.push(...entries(maybeHeaderObject.examples).map(translateToExample, this).filter(isNonNullable));

  if ('example' in maybeHeaderObject) {
    examples.push(translateToDefaultExample.call(this, '__default', maybeHeaderObject.example));
  }

  return {
    ...baseContent,
    encodings,
    examples,
  };
});
