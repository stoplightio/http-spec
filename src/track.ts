import { Optional } from '@stoplight/types';

const ROOT_MAP = new Map();

type Root = Record<PropertyKey, unknown>;

export function getEdge(fragment: object): Optional<string[]> {
  return ROOT_MAP.get(fragment);
}

const traps: ProxyHandler<Root> = {
  get(target, key) {
    const value = target[key] as any;

    if (typeof value === 'object' && value !== null) {
      const root = ROOT_MAP.get(target)!;
      return _trackObject(value, [...root, key]);
    }

    return value;
  },
};

function _trackObject<T extends Root = Root>(obj: T, path: string[]): T {
  const prx = new Proxy<T>(obj, traps);
  ROOT_MAP.set(obj, path);
  ROOT_MAP.set(prx, path);
  return prx;
}

export function trackObject<T extends Root = Root>(root: T): T {
  return _trackObject(root, []);
}
