import { pathToPointer } from '@stoplight/json';
import { JsonPath } from '@stoplight/types';

import { hash } from '../context';
import { IdGenerator } from '../types';

function withHash<F extends IdGenerator<Record<string, unknown>> = IdGenerator<Record<string, unknown>>>(fn: F): F {
  return <F>((ctx, hint) => {
    const id = fn(ctx, hint);
    return hint === 'schema' || hint === 'http-service' ? id : hash(fn(ctx, hint));
  });
}

function wipePathParams(p: string) {
  return p.replace(/({)[^}]+(?=})/g, '$1');
}

export const DEFAULT_ID_GENERATOR = withHash((ctx, hint) => {
  const { fragment, parentFragment, resolvedPath } = ctx.state;
  switch (hint) {
    case 'http-service':
      return String(ctx.state.document['x-stoplight-id']);

    case 'http-path': {
      const parentId = ctx.generateId('http-service');
      const [, path] = ctx.state.path;

      return `http_path-${parentId}-${wipePathParams(String(path))}`;
    }

    case 'http-operation': {
      const parentId = ctx.generateId('http-service');
      const [, path, method] = ctx.state.path;

      return `http_operation-${parentId}-${method}-${wipePathParams(String(path))}`;
    }

    case 'example': {
      const parentId =
        resolvedPath[0] === 'paths' ? ctx.unwrapIdForFragment(parentFragment) : ctx.generateId('http-service');
      return `example-${parentId}-${resolvedPath[resolvedPath.length - 1]}`;
    }

    case 'server': {
      const parentId = ctx.unwrapIdForFragment(parentFragment);
      return `http_server-${parentId}-${fragment.url}`;
    }

    case 'response': {
      const parentId = resolvedPath[0] === 'paths' ? ctx.generateId('http-operation') : ctx.generateId('http-service');
      return `http_response-${parentId}-${resolvedPath[resolvedPath.length - 1]}`;
    }

    case 'request-body': {
      const parentId = ctx.unwrapIdForFragment(parentFragment);
      return `http_request_body-${parentId}`;
    }

    case 'parameter': {
      const parentId =
        resolvedPath.length < 4
          ? ctx.generateId('http-service')
          : resolvedPath.length === 4
          ? ctx.generateId('http-path')
          : ctx.generateId('http-operation');

      const kind = fragment.in === 'path' ? 'path_param' : fragment.in;
      return `http_${kind}-${parentId}-${fragment.name}`;
    }

    case 'header': {
      const parentId = resolvedPath.length < 4 ? ctx.generateId('http-service') : ctx.generateId('http-operation');
      return `http_header-${parentId}-${resolvedPath[resolvedPath.length - 1]}`;
    }

    case 'media-type': {
      const parentId = ctx.unwrapIdForFragment(parentFragment);
      const mediaType = ctx.state.path[ctx.state.path.length - 1];
      return `http_media-${parentId}-${mediaType}`;
    }

    case 'tag': {
      const name = resolvedPath[0] === 'tags' ? fragment.name : fragment;
      const parentId = ctx.generateId('http-service');
      return `tag-${parentId}-${name}`;
    }

    case 'security-scheme': {
      const parentId = ctx.generateId('http-service');
      const key = fragment.key ?? resolvedPath[resolvedPath.length - 1];
      return `http_security-${parentId}-${key}`;
    }

    case 'schema':
      return pathToPointer(ctx.state.resolvedPath as JsonPath);

    case 'callback':
      return pathToPointer(ctx.state.resolvedPath as JsonPath);

    default:
      throw new Error('Missed hint');
  }
});
