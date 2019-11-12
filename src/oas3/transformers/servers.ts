import { INodeVariable, IServer } from '@stoplight/types';
import { map, mapValues } from 'lodash';
import { ServerObject, ServerVariableObject } from 'openapi3-ts';

export function translateToServers(servers: ServerObject[] | undefined): IServer[] {
  return map(servers, server => ({
    description: server.description,
    url: server.url,
    variables: mapValues(
      server.variables,
      (value: ServerVariableObject) =>
        ({
          default: String(value.default),
          description: String(value.description),
          enum: map(value.enum, String),
        } as INodeVariable),
    ),
  }));
}
