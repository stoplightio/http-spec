import { Dictionary, INodeVariable, IServer } from '@stoplight/types';
import { map, mapValues, pickBy } from 'lodash';
import { ServerObject, ServerVariableObject } from 'openapi3-ts';
import { isServerVariableObject } from '../guards';

export function translateToServers(servers: ServerObject[]): IServer[] {
  return servers.map(server => ({
    description: server.description,
    url: server.url,
    variables: mapValues<Dictionary<ServerVariableObject>, INodeVariable>(
      pickBy(server.variables, isServerVariableObject),
      value => ({
        default: String(value.default),
        description: String(value.description),
        enum: map(value.enum, String),
      }),
    ),
  }));
}
