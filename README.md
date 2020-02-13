# @stoplight/http-spec

## What is this

Http Spec is yet another, hopefully more pragmatic, attempt to standardise OpenAPI 2, OpenAPI 3, Postman Collections and other HTTP-related specification under a single AST to rule them all (at least in Stoplight)

There have been a lot of other attempts to have this universal thing such as API Elements, API Flow and they all failed for a number of reason, some of them have been discussed [here](https://www.youtube.com/watch?v=jn_1lJr-DLY)

## So why doing this?

Because we still need a way to interact with these documents in a standardised way, and relying on some dying intermediate format or something that neither the creators are using anymore does not make that much sense. It's better to accepts the sad state of the industry and work on the a mininal superset format that can encompass the majority of the use cases.

## How's Http Spec formed?

This repository contains *exclusively* the converters, which are the functions that take an OpenAPI2/3 document or a Postman Collection and turns it out into a tree whose structure is defined in another package, [`@stoplight/types`](https://github.com/stoplightio/types), specifically in the [http-spec file](https://github.com/stoplightio/types/blob/master/src/http-spec.ts)

You can explore the whole structure by looking at the [IHttpService](https://github.com/stoplightio/types/blob/master/src/http-spec.ts#L10) definition and checking out its descendands. You'll probably notice that it resembles a lot the current OpenAPI 3.x specification, and that's on purpose. OpenAPI 3.0 has first support and we gracefully upgrade/downgrade the other specification formats to it.

## How do I write a converter

With such foreword, the steps should be pretty clear:

1. Create a new directory in the `src/` directory
2. Create a function that from your input returns an `IHttpService`
3. Let TypeScript's error guide you while filling the missing fields (suchs as Security Scheems, Servers)
4. Create a function that's able to return an array of `IHttpOperation` from your own input
5. Profit
