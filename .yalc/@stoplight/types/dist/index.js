'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

exports.HttpParamStyles = void 0;
(function (HttpParamStyles) {
    HttpParamStyles["Simple"] = "simple";
    HttpParamStyles["Matrix"] = "matrix";
    HttpParamStyles["Label"] = "label";
    HttpParamStyles["Form"] = "form";
    HttpParamStyles["CommaDelimited"] = "commaDelimited";
    HttpParamStyles["SpaceDelimited"] = "spaceDelimited";
    HttpParamStyles["PipeDelimited"] = "pipeDelimited";
    HttpParamStyles["DeepObject"] = "deepObject";
})(exports.HttpParamStyles || (exports.HttpParamStyles = {}));

/**
 * Represents the severity of diagnostics.
 */
exports.DiagnosticSeverity = void 0;
(function (DiagnosticSeverity) {
    /**
     * Something not allowed by the rules of a language or other means.
     */
    DiagnosticSeverity[DiagnosticSeverity["Error"] = 0] = "Error";
    /**
     * Something suspicious but allowed.
     */
    DiagnosticSeverity[DiagnosticSeverity["Warning"] = 1] = "Warning";
    /**
     * Something to inform about but not a problem.
     */
    DiagnosticSeverity[DiagnosticSeverity["Information"] = 2] = "Information";
    /**
     * Something to hint to a better way of doing it, like proposing
     * a refactoring.
     */
    DiagnosticSeverity[DiagnosticSeverity["Hint"] = 3] = "Hint";
})(exports.DiagnosticSeverity || (exports.DiagnosticSeverity = {}));

/**
 * Stoplight node types
 */
exports.NodeType = void 0;
(function (NodeType) {
    NodeType["Article"] = "article";
    NodeType["HttpService"] = "http_service";
    NodeType["HttpServer"] = "http_server";
    NodeType["HttpOperation"] = "http_operation";
    NodeType["Model"] = "model";
    NodeType["Generic"] = "generic";
    NodeType["Unknown"] = "unknown";
    NodeType["TableOfContents"] = "table_of_contents";
    NodeType["SpectralRuleset"] = "spectral_ruleset";
    NodeType["Styleguide"] = "styleguide";
    NodeType["Image"] = "image";
})(exports.NodeType || (exports.NodeType = {}));
/**
 * Node data formats
 */
exports.NodeFormat = void 0;
(function (NodeFormat) {
    NodeFormat["Json"] = "json";
    NodeFormat["Markdown"] = "markdown";
    NodeFormat["Yaml"] = "yaml";
    NodeFormat["Apng"] = "apng";
    NodeFormat["Avif"] = "avif";
    NodeFormat["Bmp"] = "bmp";
    NodeFormat["Gif"] = "gif";
    NodeFormat["Jpeg"] = "jpeg";
    NodeFormat["Png"] = "png";
    NodeFormat["Svg"] = "svg";
    NodeFormat["Webp"] = "webp";
})(exports.NodeFormat || (exports.NodeFormat = {}));
