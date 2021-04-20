"use strict";
exports.__esModule = true;
/**
 * Stoplight node types
 */
var NodeType;
(function (NodeType) {
    NodeType["Article"] = "article";
    NodeType["HttpService"] = "http_service";
    NodeType["HttpServer"] = "http_server";
    NodeType["HttpOperation"] = "http_operation";
    NodeType["Model"] = "model";
    NodeType["Generic"] = "generic";
    NodeType["Unknown"] = "unknown";
    NodeType["TableOfContents"] = "table_of_contents";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
/**
 * Node data formats
 */
var NodeFormat;
(function (NodeFormat) {
    NodeFormat["Json"] = "json";
    NodeFormat["Markdown"] = "markdown";
    NodeFormat["Yaml"] = "yaml";
})(NodeFormat = exports.NodeFormat || (exports.NodeFormat = {}));
