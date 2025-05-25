# fastify-multiple-swagger

[![CI](https://github.com/inyourtime/fastify-multiple-swagger/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/inyourtime/fastify-multiple-swagger/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/fastify-multiple-swagger.svg?style=flat)](https://www.npmjs.com/package/fastify-multiple-swagger)

A Fastify plugin for generating multiple Swagger/OpenAPI documents using [@fastify/swagger](https://github.com/fastify/fastify-swagger). This plugin allows you to create and manage multiple API documentation sets within a single Fastify application.

## Features

- Generate multiple Swagger/OpenAPI documents
- Support for both JSON and YAML formats
- Customizable route prefixes and document names
- Integration with `Scalar API Reference` and `Swagger UI`
- TypeScript support
- Configurable document exposure options

## Installation

```bash
npm install fastify-multiple-swagger
```

## Usage

### Basic Setup

```javascript
import Fastify from "fastify";
import fastifyMultipleSwagger from "fastify-multiple-swagger";

const fastify = Fastify();

await fastify.register(fastifyMultipleSwagger, {
  documents: [
    {
      documentRef: "internal",
      swaggerOptions: {
        openapi: {
          info: {
            title: "Internal API",
            version: "1.0.0",
          },
        },
      },
    },
    {
      documentRef: "external",
      swaggerOptions: {
        openapi: {
          info: {
            title: "External API",
            version: "1.0.0",
          },
        },
      },
    },
  ],
});

// To associate routes with specific Swagger documents, use the `documentRef` in the route configuration
fastify.get(
  "/internal/route",
  {
    schema: {
      // Your schema definition
    },
    config: {
      documentRef: "internal",
    },
  },
  handler
);

fastify.get(
  "/external/route",
  {
    schema: {
      // Your schema definition
    },
    config: {
      documentRef: "external",
    },
  },
  handler
);

await fastify.ready();

fastify.getDocument("internal");
fastify.getDocument("external");
```

### Integration with Scalar API Reference

```javascript
import fastifyMultipleSwagger from "fastify-multiple-swagger";
import Scalar from "@scalar/fastify-api-reference";

await fastify.register(fastifyMultipleSwagger, {
  documents: [
    {
      documentRef: "internal",
      name: "Internal API",
      meta: {
        default: true,
      },
      swaggerOptions: {
        openapi: {
          info: {
            title: "Internal API",
            version: "1.0.0",
          },
        },
      },
    },
  ],
});

await fastify.register(Scalar, {
  routePrefix: "/reference",
  configuration: {
    sources: fastify.getDocumentSources({ scalar: true }),
  },
});
```

### Integration with Swagger UI

```javascript
import fastifyMultipleSwagger from "fastify-multiple-swagger";
import SwaggerUI from "@fastify/swagger-ui";

await fastify.register(fastifyMultipleSwagger, {
  documents: [
    {
      documentRef: "internal",
      name: "Internal API",
      swaggerOptions: {
        openapi: {
          info: {
            title: "Internal API",
            version: "1.0.0",
          },
        },
      },
    },
  ],
});

await fastify.register(SwaggerUI, {
  routePrefix: "/reference",
  uiConfig: {
    urls: fastify.getDocumentSources({ swaggerUI: true }),
  },
});
```

## Configuration Options

### Plugin Options

- `documents` (required): Array of document configurations
  - Can be strings (documentRef names) or objects with detailed configuration
- `defaultDocumentRef` (optional): Default documentRef name for routes without explicit documentRef
- `routePrefix` (optional): Global prefix for all document routes (json and yaml)

### Document Options

- `documentRef` (required): Unique reference name for the Swagger document
- `exposeRoute` (optional): Configuration for exposing JSON/YAML routes
  - Can be boolean or object with `json` and `yaml` properties
- `swaggerOptions` (optional): Configuration passed to @fastify/swagger
- `name` (optional): Display name for the UI providers
- `meta` (optional): Additional metadata for UI providers configuration

## API

### getDocumentSources

Returns an array of document sources, with optional filters to return only Scalar or Swagger UI sources.

parameters:

- `opts` (`object`, optional)  
  An optional configuration object that filters the type of sources to return. Only one of the following options should be used at a time:

  - `scalar` (`boolean`)  
    If `true`, returns only Scalar document sources.

  - `swaggerUI` (`boolean`)  
    If `true`, returns only Swagger UI document sources.

### getDocument(documentRef, opts?)

Returns a Swagger (OpenAPI) document by its `documentRef`. If the reference does not exist, an error is thrown.

parameters:

- `documentRef` (`string`)  
  The reference ID of the Swagger document to retrieve.

- `opts` (`object`, optional)  
  An optional configuration object.

  - `yaml` (`boolean`, optional)  
    Determines the output format:
    - `true`: Returns the document as a YAML `string`.
    - `false` or omitted: Returns the document as a JavaScript object (`OpenAPI.Document`).

## License

MIT
