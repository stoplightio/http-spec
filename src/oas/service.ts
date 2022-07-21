import { isPlainObject } from '@stoplight/json';
import { DeepPartial, IHttpService } from '@stoplight/types';
import pickBy = require('lodash.pickby');
import { OpenAPIObject } from 'openapi3-ts';
import { Spec } from 'swagger-schema-official';

import { isBoolean, isNonNullable, isString } from '../guards';
import { TranslateFunction } from '../types';
import { hasXLogo } from './guards';
import { translateTagDefinition } from './tags';
import { translateLogo } from './transformers/translateLogo';

export const transformOasService: TranslateFunction<DeepPartial<OpenAPIObject> | DeepPartial<Spec>, [], IHttpService> =
  function () {
    const document = this.document;
    const id = String(document['x-stoplight']?.id);
    this.ids.service = id;
    this.parentId = id;

    const httpService: IHttpService = {
      id,

      version: document.info?.version ?? '',
      name: document.info?.title ?? 'no-title',

      ...pickBy(
        {
          description: document.info?.description,
          termsOfService: document.info?.termsOfService,
        },
        isString,
      ),

      ...pickBy(
        {
          contact: document.info?.contact,
        },
        isPlainObject,
      ),

      ...pickBy(
        {
          internal: document['x-internal'],
        },
        isBoolean,
      ),
    };

    if (isPlainObject(document.info) && hasXLogo(document.info)) {
      httpService.logo = translateLogo(document.info);
    }

    const tags = Array.isArray(document.tags)
      ? document.tags.map(translateTagDefinition, this).filter(isNonNullable)
      : [];

    if (tags.length > 0) {
      httpService.tags = tags;
    }

    return httpService;
  };
