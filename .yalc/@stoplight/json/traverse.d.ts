export declare const traverse: (obj: unknown, func: (opts: {
    parent: unknown;
    parentPath: import("@stoplight/types").Segment[];
    property: import("@stoplight/types").Segment;
    propertyValue: unknown;
}) => void, path?: import("@stoplight/types").Segment[]) => void;
