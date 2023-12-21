import { isNonNullable } from './guards';
import { HttpSecurityKind } from './types';

type Context = { parentId: string };

function join(dependencies: (string | undefined)[]) {
  return dependencies.join('-');
}

function sortAlphabetically(input: string[]) {
  return input.slice().sort((a, b) => a.localeCompare(b));
}

function sanitizePath(path: string) {
  return path.replace(/({)[^}]+(?=})/g, '$1');
}

export const idGenerators = {
  tag: (props: { name: string }) => {
    return join(['tag', props.name]);
  },

  schema: (props: Context & { key: string }) => {
    return join(['schema', props.parentId, props.key]);
  },

  schemaProperty: (props: Context & { key: string | number }) => {
    return join(['schema_property', props.parentId, String(props.key)]);
  },

  example: (props: Context & { keyOrName: string }) => {
    return join(['example', props.parentId, props.keyOrName]);
  },

  httpPath: (props: Context & { path: string }) => {
    return join(['http_path', props.parentId, sanitizePath(props.path)]);
  },

  httpWebhookName: (props: Context & { name: string }) => {
    return join(['http_webhook_name', props.parentId, sanitizePath(props.name)]);
  },

  httpOperation: (props: Context & { method: string; path: string }) => {
    return join(['http_operation', props.parentId, props.method, sanitizePath(props.path)]);
  },

  httpWebhookOperation: (props: Context & { method: string; name: string }) => {
    return join(['http_webhook_operation', props.parentId, props.method, sanitizePath(props.name)]);
  },

  httpCallbackOperation: (props: Context & { method: string; path: string; key: string }) => {
    return join(['http_callback', props.parentId, props.key, props.method, props.path]);
  },

  httpPathParam: (props: Context & { keyOrName: string }) => {
    return join(['http_path_param', props.parentId, props.keyOrName]);
  },

  httpQuery: (props: Context & { keyOrName: string }) => {
    return join(['http_query', props.parentId, props.keyOrName]);
  },

  httpCookie: (props: Context & { keyOrName: string }) => {
    return join(['http_cookie', props.parentId, props.keyOrName]);
  },

  httpHeader: (props: Context & { keyOrName: string; componentType: 'parameter' | 'header' | 'unknown' }) => {
    return join(['http_header', props.parentId, props.componentType, props.keyOrName]);
  },

  httpRequestBody: (props: Context & { key?: string; consumes?: string[] }) => {
    const deps = [
      'http_request_body',
      props.parentId,
      ...(Array.isArray(props.consumes) ? sortAlphabetically(props.consumes) : []),
    ];

    // this is for backwards compatibility
    // we don't want an empty key to be added as we do for schemas because that would invalidate older ids
    if (isNonNullable(props.key)) {
      deps.push(props.key);
    }

    return join(deps);
  },

  httpMedia: (props: { parentId: string; mediaType?: string }) => {
    return join(['http_media', props.parentId, props.mediaType]);
  },

  httpSecurity: (props: {
    parentId: string;
    keyOrName?: string;
    kind: HttpSecurityKind;
    index?: number;
    scopeKeys?: string[];
  }) => {
    return join([
      'http_security',
      props.parentId,
      props.kind,
      props.keyOrName,
      ...(props.kind === 'requirement' ? [String(props.index ?? ''), props.scopeKeys?.join('|') ?? ''] : []),
    ]);
  },

  httpServer: (props: { parentId: string; url: string }) => {
    return join(['http_server', props.parentId, props.url]);
  },

  /**
   * Supply response code if available, key otherwise (e.g. for shared responses)
   */
  httpResponse: (props: { parentId: string; codeOrKey: string; produces?: string[] }) => {
    return join([
      'http_response',
      props.parentId,
      props.codeOrKey,
      ...(Array.isArray(props.produces) ? sortAlphabetically(props.produces) : []),
    ]);
  },
};
