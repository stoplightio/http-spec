type Context = { parentId: string };

function hash(dependencies: (string | undefined)[]) {
  return dependencies.join('-');
}

function sortAlphabetically(input: string[]) {
  return input.slice().sort((a, b) => a.localeCompare(b));
}

function sanitizePath(path: string) {
  return path.replace(/({)[^}]+(?=})/g, '$1');
}

export const idGenerators = {
  tag: (props: Context & { name: string }) => {
    return hash(['tag', props.name]);
  },

  schema: (props: Context & { key: string }) => {
    return hash(['schema', props.parentId, props.key]);
  },

  schemaProperty: (props: Context & { key: string | number }) => {
    return hash(['schema_property', props.parentId, String(props.key)]);
  },

  example: (props: Context & { nameOrKey: string }) => {
    return hash(['example', props.parentId, props.nameOrKey]);
  },

  httpPath: (props: Context & { path: string }) => {
    return hash(['http_path', props.parentId, sanitizePath(props.path)]);
  },

  httpOperation: (props: Context & { method: string; path: string }) => {
    return hash(['http_operation', props.parentId, props.method, sanitizePath(props.path)]);
  },

  httpPathParam: (props: Context & { nameOrKey: string }) => {
    return hash(['http_path_param', props.parentId, props.nameOrKey]);
  },

  httpQuery: (props: Context & { nameOrKey: string }) => {
    return hash(['http_query', props.parentId, props.nameOrKey]);
  },

  httpCookie: (props: Context & { nameOrKey: string }) => {
    return hash(['http_cookie', props.parentId, props.nameOrKey]);
  },

  httpHeader: (props: Context & { nameOrKey: string }) => {
    return hash(['http_header', props.parentId, props.nameOrKey]);
  },

  httpRequestBody: (props: { parentId: string; consumes?: string[] }) => {
    return hash([
      'http_request_body',
      props.parentId,
      ...(Array.isArray(props.consumes) ? sortAlphabetically(props.consumes) : []),
    ]);
  },

  httpMedia: (props: { parentId: string; mediaType?: string }) => {
    return hash(['http_media', props.parentId, props.mediaType]);
  },

  httpSecurity: (props: { parentId: string; nameOrKey?: string }) => {
    return hash(['http_security', props.parentId, props.nameOrKey]);
  },

  httpServer: (props: { parentId: string; url: string }) => {
    return hash(['http_server', props.parentId, props.url]);
  },

  /**
   * Supply response code if available, key otherwise (e.g. for shared responses)
   */
  httpResponse: (props: { parentId: string; codeOrKey: string; produces?: string[] }) => {
    return hash([
      'http_response',
      props.parentId,
      props.codeOrKey,
      ...(Array.isArray(props.produces) ? sortAlphabetically(props.produces) : []),
    ]);
  },
};
