import { DeepPartial, Dictionary, INodeVariable, IServer } from '@stoplight/types';
import { map, mapValues, pickBy } from 'lodash';
import { ServerObject, ServerVariableObject } from 'openapi3-ts';
import { isServerVariableObject } from '../guards';

export function translateToServers(servers: ServerObject[]): IServer[] {
  return servers.map(server => ({
    description: server.description,
    url: server.url,
    variables: server.variables && translateServerVariables(server.variables),
  }));
}

export function translateServerVariables(variables: DeepPartial<{ [v: string]: ServerVariableObject }>) {
  return mapValues<Dictionary<ServerVariableObject>, INodeVariable>(
    pickBy(variables, isServerVariableObject),
    value => ({
      default: String(value.default),
      description: value.description && String(value.description),
      enum: value.enum && map(value.enum, String),
    }),
  );
}
