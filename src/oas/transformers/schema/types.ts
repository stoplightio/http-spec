import type { JSONSchema7 } from 'json-schema';
import type { SchemaObject } from 'openapi3-ts/src/model/OpenApi';
import type { Schema } from 'swagger-schema-official';

import { Fragment } from '../../../types';

export type OASSchemaObject = SchemaObject | Schema;

export type Converter = (schema: OASSchemaObject | JSONSchema7, document: Fragment) => void;
