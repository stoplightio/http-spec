import { flatten, map, uniq } from 'lodash';
import * as URIJS from 'urijs';

import { pathToPointer, pointerToPath } from '@stoplight/json';

export function uniqFlatMap<T>(collection?: T[]) {
  return uniq(flatten(map(collection, Object.keys)));
}

// wraps urijs to handle edge cases that would normally error out or cause unexpected behavior
// in all funcs set a default empty string, since URI.func() !== URI.func(undefined) [<- undefined throw error in most cases]
// in all funcs set a default empty string, since URI.func('') will reset fields back to null while URI.func() will not
export function URI(url: string | uri.URI = '') {
  const uri: uri.URI = !url || typeof url === 'string' ? new URIJS(url) : url;

  return {
    scheme: (type: string = '') => URI(uri.scheme(type)),

    // if host includes a port that is not valid (a non-number) we encode the host to avoid errors and have it stored under uri.hostname
    host: (host: string = '') =>
      URI(uri.host(typeof host === 'string' && Number.isNaN(Number(host.split(':')[1])) ? URIJS.encode(host) : host)),

    // if we try to set port directly and it is invalid (a non-number) reset the port to null
    port: (port: string = '') => URI(uri.port(Number.isNaN(Number(port)) ? '' : port)),

    path: (path: string = '') => URI(uri.path(path)),

    pointer: (pathOrPointer: string | string[]) =>
      URI(uri.hash(Array.isArray(pathOrPointer) ? pathToPointer(pathOrPointer) : pathOrPointer)),

    // decode uri since some of the built in uri functions encode the args,
    // normalize the uri to remove extra slash characters, and have uniform capitzalization where appropriate (schemes)
    toString: () => URIJS.decode(uri.normalize().valueOf()),

    append: (path: string = '') => {
      const uri2 = new URIJS(path);

      if (uri.fragment()) {
        if (uri2.fragment()) {
          return URI(uri.fragment(uri2.fragment()));
        } else {
          return URI(uri.hash(pathToPointer([...pointerToPath(uri.hash()), path])));
        }
      } else {
        if (uri2.fragment()) {
          return URI(uri.fragment(pathToPointer([path.split('#/')[1]])));
        } else {
          return URI(uri.segment([...uri.segment(), path]));
        }
      }
    },
  };
}
