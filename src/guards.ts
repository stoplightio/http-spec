export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null;
}

export function isBoolean(input: unknown): input is boolean {
  return typeof input === 'boolean';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isSerializablePrimitive(value: unknown): value is string | number | boolean | null {
  return isBoolean(value) || isString(value) || typeof value === 'number' || value === null;
}
