import { isObject as isObject$1, cloneDeep, get, has, set, trimStart as trimStart$1 } from 'lodash';
import { createScanner, findNodeAtOffset, getNodePath, visit, printParseErrorCode } from 'jsonc-parser';
import createOrderedObject, { getOrder, ORDER_KEY_ID } from '@stoplight/ordered-object-literal';
import { DiagnosticSeverity } from '@stoplight/types';
import fastStringify from 'safe-stable-stringify';

const hasRef = (obj) => isObject$1(obj) && '$ref' in obj && typeof obj.$ref === 'string';

const isLocalRef = (pointer) => pointer.length > 0 && pointer[0] === '#';

const replaceInString = (str, find, repl) => {
    const orig = str.toString();
    let res = '';
    let rem = orig;
    let beg = 0;
    let end = rem.indexOf(find);
    while (end > -1) {
        res += orig.substring(beg, beg + end) + repl;
        rem = rem.substring(end + find.length, rem.length);
        beg += end + find.length;
        end = rem.indexOf(find);
    }
    if (rem.length > 0) {
        res += orig.substring(orig.length - rem.length, orig.length);
    }
    return res;
};

const encodePointerFragment = (value) => {
    return typeof value === 'number' ? value : replaceInString(replaceInString(value, '~', '~0'), '/', '~1');
};

const pathToPointer = (path) => {
    return encodeUriFragmentIdentifier(path);
};
const encodeUriFragmentIdentifier = (path) => {
    if (path && typeof path !== 'object') {
        throw new TypeError('Invalid type: path must be an array of segments.');
    }
    if (path.length === 0) {
        return '#';
    }
    return `#/${path.map(encodePointerFragment).join('/')}`;
};

const decodePointer = (value) => {
    return replaceInString(replaceInString(decodeURIComponent('' + value), '~1', '/'), '~0', '~');
};

const pointerToPath = (pointer) => {
    return decodeUriFragmentIdentifier(pointer);
};
const decodeFragmentSegments = (segments) => {
    const len = segments.length;
    const res = [];
    let i = -1;
    while (++i < len) {
        res.push(decodePointer(segments[i]));
    }
    return res;
};
const decodeUriFragmentIdentifier = (ptr) => {
    if (typeof ptr !== 'string') {
        throw new TypeError('Invalid type: JSON Pointers are represented as strings.');
    }
    if (ptr.length === 0 || ptr[0] !== '#') {
        throw new URIError('Invalid JSON Pointer syntax; URI fragment identifiers must begin with a hash.');
    }
    if (ptr.length === 1) {
        return [];
    }
    if (ptr[1] !== '/') {
        throw new URIError('Invalid JSON Pointer syntax.');
    }
    return decodeFragmentSegments(ptr.substring(2).split('/'));
};

const traverse = (obj, func, path = []) => {
    if (!obj || typeof obj !== 'object')
        return;
    for (const i in obj) {
        if (!obj.hasOwnProperty(i))
            continue;
        func({ parent: obj, parentPath: path, property: i, propertyValue: obj[i] });
        if (obj[i] && typeof obj[i] === 'object') {
            traverse(obj[i], func, path.concat(i));
        }
    }
};

const BUNDLE_ROOT = '__bundled__';
const ERRORS_ROOT = '__errors__';
const bundleTarget = ({ document, path }, cur) => _bundle(cloneDeep(document), path, { [path]: true }, cur);
const _bundle = (document, path, stack, cur, bundledRefInventory = {}, bundledObj = {}, errorsObj = {}) => {
    const objectToBundle = get(document, pointerToPath(path));
    traverse(cur ? cur : objectToBundle, ({ parent }) => {
        if (hasRef(parent) && isLocalRef(parent.$ref)) {
            const $ref = parent.$ref;
            if (errorsObj[$ref])
                return;
            if (bundledRefInventory[$ref]) {
                parent.$ref = bundledRefInventory[$ref];
                return;
            }
            let _path;
            let inventoryPath;
            let inventoryRef;
            try {
                _path = pointerToPath($ref);
                inventoryPath = [BUNDLE_ROOT, ..._path];
                inventoryRef = pathToPointer(inventoryPath);
            }
            catch (error) {
                errorsObj[$ref] = error.message;
            }
            if (!_path || !inventoryPath || !inventoryRef)
                return;
            const bundled$Ref = get(document, _path);
            if (bundled$Ref) {
                const pathProcessed = [];
                bundledRefInventory[$ref] = inventoryRef;
                parent.$ref = inventoryRef;
                for (const key of _path) {
                    pathProcessed.push(key);
                    const inventoryPathProcessed = [BUNDLE_ROOT, ...pathProcessed];
                    if (has(bundledObj, inventoryPathProcessed))
                        continue;
                    const target = get(document, pathProcessed);
                    if (Array.isArray(target)) {
                        set(bundledObj, inventoryPathProcessed, new Array(target.length).fill(null));
                    }
                    else if (typeof target === 'object') {
                        set(bundledObj, inventoryPathProcessed, {});
                    }
                }
                set(bundledObj, inventoryPath, bundled$Ref);
                if (!stack[$ref]) {
                    stack[$ref] = true;
                    _bundle(document, path, stack, bundled$Ref, bundledRefInventory, bundledObj, errorsObj);
                    stack[$ref] = false;
                }
            }
        }
    });
    set(objectToBundle, BUNDLE_ROOT, bundledObj[BUNDLE_ROOT]);
    if (Object.keys(errorsObj).length) {
        set(objectToBundle, ERRORS_ROOT, errorsObj);
    }
    return objectToBundle;
};

const decodePointerFragment = (value) => {
    return replaceInString(replaceInString(value, '~1', '/'), '~0', '~');
};

const encodePointer = (value) => {
    return replaceInString(replaceInString(value, '~', '~0'), '//', '/~1');
};

const extractPointerFromRef = (ref) => {
    if (typeof ref !== 'string' || ref.length === 0) {
        return null;
    }
    const index = ref.indexOf('#');
    return index === -1 ? null : ref.slice(index);
};

const extractSourceFromRef = (ref) => {
    if (typeof ref !== 'string' || ref.length === 0 || isLocalRef(ref)) {
        return null;
    }
    const index = ref.indexOf('#');
    return index === -1 ? ref : ref.slice(0, index);
};

const getFirstPrimitiveProperty = (text) => {
    const scanner = createScanner(text, true);
    scanner.scan();
    if (scanner.getToken() !== 1) {
        return;
    }
    scanner.scan();
    if (scanner.getToken() === 2) {
        return;
    }
    if (scanner.getToken() !== 10) {
        throw new SyntaxError('Unexpected character');
    }
    const property = scanner.getTokenValue();
    scanner.scan();
    if (scanner.getToken() !== 6) {
        throw new SyntaxError('Colon expected');
    }
    scanner.scan();
    switch (scanner.getToken()) {
        case 10:
            return [property, scanner.getTokenValue()];
        case 11:
            return [property, Number(scanner.getTokenValue())];
        case 8:
            return [property, true];
        case 9:
            return [property, false];
        case 7:
            return [property, null];
        case 16:
            throw new SyntaxError('Unexpected character');
        case 17:
            throw new SyntaxError('Unexpected end of file');
        default:
            return;
    }
};

const getJsonPathForPosition = ({ lineMap, ast }, position) => {
    const startOffset = lineMap[position.line];
    const endOffset = lineMap[position.line + 1];
    if (startOffset === void 0) {
        return;
    }
    const node = findNodeAtOffset(ast, endOffset === void 0 ? startOffset + position.character : Math.min(endOffset, startOffset + position.character), true);
    if (node === undefined) {
        return;
    }
    const path = getNodePath(node);
    if (path.length === 0)
        return;
    return path;
};

function getLastPathSegment(path) {
    return decodePointerFragment(path.split('/').pop() || '');
}

const getLocationForJsonPath = ({ lineMap, ast }, path, closest = false) => {
    const node = findNodeAtPath(ast, path, closest);
    if (node === void 0 || node.range === void 0) {
        return;
    }
    return { range: node.range };
};
function findNodeAtPath(node, path, closest) {
    pathLoop: for (const part of path) {
        const segment = Number.isInteger(Number(part)) ? Number(part) : part;
        if (typeof segment === 'string' || (typeof segment === 'number' && node.type !== 'array')) {
            if (node.type !== 'object' || !Array.isArray(node.children)) {
                return closest ? node : void 0;
            }
            for (const propertyNode of node.children) {
                if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === String(segment)) {
                    node = propertyNode.children[1];
                    continue pathLoop;
                }
            }
            return closest ? node : void 0;
        }
        else {
            if (node.type !== 'array' || segment < 0 || !Array.isArray(node.children) || segment >= node.children.length) {
                return closest ? node : void 0;
            }
            node = node.children[segment];
        }
    }
    return node;
}

function isObject(maybeObj) {
    return typeof maybeObj === 'object' && maybeObj !== null;
}
function _resolveInlineRef(document, ref, seen) {
    const source = extractSourceFromRef(ref);
    if (source !== null) {
        throw new ReferenceError('Cannot resolve external references');
    }
    const path = pointerToPath(ref);
    let value = document;
    for (const segment of path) {
        if (!isObject(value) || !(segment in value)) {
            throw new ReferenceError(`Could not resolve '${ref}'`);
        }
        value = value[segment];
        if (isObject(value) && '$ref' in value) {
            if (seen.includes(value)) {
                return seen[seen.length - 1];
            }
            seen.push(value);
            if (typeof value.$ref !== 'string') {
                throw new TypeError('$ref should be a string');
            }
            value = _resolveInlineRef(document, value.$ref, seen);
        }
    }
    return value;
}
function resolveInlineRef(document, ref) {
    return _resolveInlineRef(document, ref, []);
}

const TMP_MAP = new WeakMap();
const traps = {
    get(target, key, recv) {
        const value = Reflect.get(target, key, recv);
        if (typeof value === 'object' && value !== null) {
            const root = TMP_MAP.get(target);
            TMP_MAP.delete(target);
            if (!('$ref' in value)) {
                return _lazyInlineResolver(value, root);
            }
            const resolved = resolveInlineRef(root, value.$ref);
            if (typeof resolved === 'object' && resolved !== null) {
                return _lazyInlineResolver(resolved, root);
            }
            return resolved;
        }
        return value;
    },
};
function _lazyInlineResolver(obj, root) {
    TMP_MAP.set(obj, root);
    return new Proxy(obj, traps);
}
function lazyInlineResolver(root) {
    return _lazyInlineResolver(root, root);
}

const parseWithPointers = (value, options = { disallowComments: true }) => {
    const diagnostics = [];
    const { ast, data, lineMap } = parseTree(value, diagnostics, options);
    return {
        data,
        diagnostics,
        ast,
        lineMap,
    };
};
function parseTree(text, errors = [], options) {
    const lineMap = computeLineMap(text);
    let currentParent = { type: 'array', offset: -1, length: -1, children: [], parent: void 0 };
    let currentParsedProperty = null;
    let currentParsedParent = [];
    const objectKeys = new WeakMap();
    const previousParsedParents = [];
    function ensurePropertyComplete(endOffset) {
        if (currentParent.type === 'property') {
            currentParent.length = endOffset - currentParent.offset;
            currentParent = currentParent.parent;
        }
    }
    function calculateRange(startLine, startCharacter, length) {
        return {
            start: {
                line: startLine,
                character: startCharacter,
            },
            end: {
                line: startLine,
                character: startCharacter + length,
            },
        };
    }
    function onValue(valueNode) {
        currentParent.children.push(valueNode);
        return valueNode;
    }
    function onParsedValue(value) {
        if (Array.isArray(currentParsedParent)) {
            currentParsedParent.push(value);
        }
        else if (currentParsedProperty !== null) {
            currentParsedParent[currentParsedProperty] = value;
        }
    }
    function onParsedComplexBegin(value) {
        onParsedValue(value);
        previousParsedParents.push(currentParsedParent);
        currentParsedParent = value;
        currentParsedProperty = null;
    }
    function onParsedComplexEnd() {
        currentParsedParent = previousParsedParents.pop();
    }
    const visitor = {
        onObjectBegin: (offset, length, startLine, startCharacter) => {
            currentParent = onValue({
                type: 'object',
                offset,
                length: -1,
                parent: currentParent,
                children: [],
                range: calculateRange(startLine, startCharacter, length),
            });
            if (options.ignoreDuplicateKeys === false) {
                objectKeys.set(currentParent, []);
            }
            onParsedComplexBegin(createObjectLiteral(options.preserveKeyOrder === true));
        },
        onObjectProperty: (name, offset, length, startLine, startCharacter) => {
            currentParent = onValue({ type: 'property', offset, length: -1, parent: currentParent, children: [] });
            currentParent.children.push({ type: 'string', value: name, offset, length, parent: currentParent });
            if (options.ignoreDuplicateKeys === false) {
                const currentObjectKeys = objectKeys.get(currentParent.parent);
                if (currentObjectKeys) {
                    if (currentObjectKeys.length === 0 || !currentObjectKeys.includes(name)) {
                        currentObjectKeys.push(name);
                    }
                    else {
                        errors.push({
                            range: calculateRange(startLine, startCharacter, length),
                            message: 'DuplicateKey',
                            severity: DiagnosticSeverity.Error,
                            path: getJsonPath(currentParent),
                            code: 20,
                        });
                    }
                }
            }
            if (options.preserveKeyOrder === true) {
                swapKey(currentParsedParent, name);
            }
            currentParsedProperty = name;
        },
        onObjectEnd: (offset, length, startLine, startCharacter) => {
            if (options.ignoreDuplicateKeys === false) {
                objectKeys.delete(currentParent);
            }
            currentParent.length = offset + length - currentParent.offset;
            if (currentParent.range) {
                currentParent.range.end.line = startLine;
                currentParent.range.end.character = startCharacter + length;
            }
            currentParent = currentParent.parent;
            ensurePropertyComplete(offset + length);
            onParsedComplexEnd();
        },
        onArrayBegin: (offset, length, startLine, startCharacter) => {
            currentParent = onValue({
                type: 'array',
                offset,
                length: -1,
                parent: currentParent,
                children: [],
                range: calculateRange(startLine, startCharacter, length),
            });
            onParsedComplexBegin([]);
        },
        onArrayEnd: (offset, length, startLine, startCharacter) => {
            currentParent.length = offset + length - currentParent.offset;
            if (currentParent.range) {
                currentParent.range.end.line = startLine;
                currentParent.range.end.character = startCharacter + length;
            }
            currentParent = currentParent.parent;
            ensurePropertyComplete(offset + length);
            onParsedComplexEnd();
        },
        onLiteralValue: (value, offset, length, startLine, startCharacter) => {
            onValue({
                type: getLiteralNodeType(value),
                offset,
                length,
                parent: currentParent,
                value,
                range: calculateRange(startLine, startCharacter, length),
            });
            ensurePropertyComplete(offset + length);
            onParsedValue(value);
        },
        onSeparator: (sep, offset, length) => {
            if (currentParent.type === 'property') {
                if (sep === ':') {
                    currentParent.colonOffset = offset;
                }
                else if (sep === ',') {
                    ensurePropertyComplete(offset);
                }
            }
        },
        onError: (error, offset, length, startLine, startCharacter) => {
            errors.push({
                range: calculateRange(startLine, startCharacter, length),
                message: printParseErrorCode(error),
                severity: DiagnosticSeverity.Error,
                code: error,
            });
        },
    };
    visit(text, visitor, options);
    const result = currentParent.children[0];
    if (result) {
        delete result.parent;
    }
    return {
        ast: result,
        data: currentParsedParent[0],
        lineMap,
    };
}
function getLiteralNodeType(value) {
    switch (typeof value) {
        case 'boolean':
            return 'boolean';
        case 'number':
            return 'number';
        case 'string':
            return 'string';
        default:
            return 'null';
    }
}
const computeLineMap = (input) => {
    const lineMap = [0];
    let i = 0;
    for (; i < input.length; i++) {
        if (input[i] === '\n') {
            lineMap.push(i + 1);
        }
    }
    lineMap.push(i + 1);
    return lineMap;
};
function getJsonPath(node, path = []) {
    if (node.type === 'property') {
        path.unshift(node.children[0].value);
    }
    if (node.parent !== void 0) {
        if (node.parent.type === 'array' && node.parent.parent !== void 0) {
            path.unshift(node.parent.children.indexOf(node));
        }
        return getJsonPath(node.parent, path);
    }
    return path;
}
function createObjectLiteral(preserveKeyOrder) {
    return preserveKeyOrder ? createOrderedObject({}) : {};
}
function swapKey(container, key) {
    if (!(key in container))
        return;
    const order = getOrder(container);
    const index = order.indexOf(key);
    if (index !== -1) {
        order.splice(index, 1);
        order.push(key);
    }
}

const renameObjectKey = (obj, oldKey, newKey) => {
    if (!obj || !Object.hasOwnProperty.call(obj, oldKey) || oldKey === newKey) {
        return obj;
    }
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
        if (key === oldKey) {
            newObj[newKey] = value;
        }
        else if (!(key in newObj)) {
            newObj[key] = value;
        }
    }
    return newObj;
};

const safeParse = (text, reviver) => {
    if (typeof text !== 'string')
        return text;
    try {
        const num = parseNumber(text);
        if (typeof num === 'string')
            return num;
        return JSON.parse(text, reviver);
    }
    catch (e) {
        return void 0;
    }
};
const parseNumber = (string) => {
    const numVal = Number(string);
    if (Number.isFinite(numVal)) {
        if (String(numVal) === string) {
            return numVal;
        }
        return string;
    }
    return NaN;
};

const safeStringify = (value, replacer, space) => {
    if (typeof value === 'string') {
        return value;
    }
    try {
        return JSON.stringify(value, replacer, space);
    }
    catch (_a) {
        return fastStringify(value, replacer, space);
    }
};

const startsWith = (source, val) => {
    if (source instanceof Array) {
        if (val instanceof Array) {
            if (val.length > source.length)
                return false;
            for (const i in val) {
                if (!val.hasOwnProperty(i))
                    continue;
                const si = parseInt(source[i]);
                const vi = parseInt(val[i]);
                if (!isNaN(si) || !isNaN(vi)) {
                    if (si !== vi) {
                        return false;
                    }
                }
                else if (source[i] !== val[i]) {
                    return false;
                }
            }
        }
    }
    else if (typeof source === 'string') {
        if (typeof val === 'string') {
            return source.startsWith(val);
        }
    }
    else {
        return false;
    }
    return true;
};

const stringify = (value, replacer, space) => {
    const stringified = safeStringify(value, replacer, space);
    if (stringified === void 0) {
        throw new Error('The value could not be stringified');
    }
    return stringified;
};

function toPropertyPath(path) {
    return path
        .replace(/^(\/|#\/)/, '')
        .split('/')
        .map(decodePointerFragment)
        .map(sanitize)
        .join('.');
}
function sanitize(fragment) {
    if (fragment.includes('.')) {
        return `["${fragment.replace(/"/g, '\\"')}"]`;
    }
    else {
        return fragment;
    }
}

const KEYS = Symbol.for(ORDER_KEY_ID);
const traps$1 = {
    ownKeys(target) {
        return KEYS in target ? target[KEYS] : Reflect.ownKeys(target);
    },
};
const trapAccess = (target) => new Proxy(target, traps$1);

function trimStart(target, elems) {
    if (typeof target === 'string' && typeof elems === 'string') {
        return trimStart$1(target, elems);
    }
    if (!target || !Array.isArray(target) || !target.length || !elems || !Array.isArray(elems) || !elems.length)
        return target;
    let toRemove = 0;
    for (const i in target) {
        if (!target.hasOwnProperty(i))
            continue;
        if (target[i] !== elems[i])
            break;
        toRemove++;
    }
    return target.slice(toRemove);
}

export { BUNDLE_ROOT, ERRORS_ROOT, KEYS, bundleTarget, decodePointer, decodePointerFragment, encodePointer, encodePointerFragment, extractPointerFromRef, extractSourceFromRef, getFirstPrimitiveProperty, getJsonPathForPosition, getLastPathSegment, getLocationForJsonPath, hasRef, isLocalRef, lazyInlineResolver, parseTree, parseWithPointers, pathToPointer, pointerToPath, renameObjectKey, resolveInlineRef, safeParse, safeStringify, startsWith, stringify, toPropertyPath, trapAccess, traverse, trimStart };
