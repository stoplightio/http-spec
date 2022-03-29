import { Dictionary, JsonPath } from '@stoplight/types';
export declare function resolveInlineRef(document: Dictionary<unknown>, ref: string): unknown;
export declare function resolveInlineRefWithLocation(document: Dictionary<unknown>, ref: string): {
    location: JsonPath;
    value: unknown;
};
