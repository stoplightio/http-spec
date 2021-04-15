Based on https://github.com/openapi-contrib/openapi-schema-to-json-schema
and specifically on https://github.com/openapi-contrib/openapi-schema-to-json-schema/blob/master/lib/converters/schema.js
the above converter is the only one we actually used, while https://github.com/openapi-contrib/openapi-schema-to-json-schema/blob/master/lib/converters/parameter.js was never utilized

## Differences

### Removed options:
* strictMode (this was actually introduced for Stoplight, it's enabled by default now)
* dateToDateTime (was unused)
* cloneSchema (true by default now, we never want to alter schema)
* supportPatternProperties & patternPropertiesHandler (were unused)
* removeReadOnly & removeWriteOnly (were unused)
* removeProps (was unused)
* keepNotSupported

### Changed behavior:
* empty properties are not removed
