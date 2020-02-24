# @stoplight/http-spec

## What is it?

HTTP Spec is yet another, hopefully more pragmatic, attempt to standardise OpenAPI v2, OpenAPI v3, Postman Collections and other HTTP-related specification under a single AST to rule them all (at least in Stoplight).

There have been a lot of other attempts to have a universal specification such as API Elements, API Flow and they all failed for a number of reasons. Some of those have been discussed [here](https://www.youtube.com/watch?v=jn_1lJr-DLY).

## Why build it?

Stoplight needs a way to interact with these documents in a standardized way, and relying on some dying intermediate format does not make that much sense. It's better to accept the sad state of the industry and work on a minimal superset format that can encompass the majority of the use cases.

## How's HTTP Spec formed?

This repository contains *exclusively* converters functions that take OpenAPI v2, OpenAPI v3, or Postman Collection documents and transforms them into the [http-spec interface](https://github.com/stoplightio/types/blob/master/src/http-spec.ts).

You can explore the whole structure by looking at the [IHttpService](https://github.com/stoplightio/types/blob/master/src/http-spec.ts#L10) definition and checking out its descendands. You'll probably notice that it resembles a lot the current OpenAPI 3.x specification, and that's on purpose. OpenAPI 3.0 has first support and we gracefully upgrade/downgrade the other specification formats to it.

## How do I write a converter?

If you would like to add support for another API description format, like RAML, follow these steps:

1. Create a new directory in the `src/` directory
2. Create a function that from your input returns an `IHttpService`
3. Let the TypeScript errors guide you while filling out the missing fields (such as Security Schemes, Servers)
4. Create a function that's able to return an array of `IHttpOperation` from your own input
5. Profit
