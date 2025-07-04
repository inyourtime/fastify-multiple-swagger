# fastify-multiple-swagger

[![CI](https://github.com/inyourtime/fastify-multiple-swagger/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/inyourtime/fastify-multiple-swagger/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/fastify-multiple-swagger.svg?style=flat)](https://www.npmjs.com/package/fastify-multiple-swagger)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](./LICENSE)

A Fastify plugin that generates multiple Swagger/OpenAPI documents using [@fastify/swagger](https://github.com/fastify/fastify-swagger) within a single application. Create separate API documentation for different parts of your API (internal, external, versioned, etc.).

## Installation

```bash
npm install fastify-multiple-swagger
```

## Compatibility

| Plugin Version | Fastify Version |
|:--------------:|:---------------:|
| `>=1.x`        | `^5.x`          |

## Quick Start

```javascript
import Fastify from "fastify";
import fastifyMultipleSwagger from "fastify-multiple-swagger";

const fastify = Fastify();

// Register the plugin
await fastify.register(fastifyMultipleSwagger, {
  documents: [
    {
      documentRef: "internal",
      swaggerOptions: {
        openapi: {
          info: { title: "Internal API", version: "1.0.0" }
        }
      }
    },
    {
      documentRef: "external", 
      swaggerOptions: {
        openapi: {
          info: { title: "External API", version: "1.0.0" }
        }
      }
    }
  ]
});

// Associate routes with documents
fastify.get("/internal/users", {
  config: { documentRef: "internal" },
  schema: { /* your schema */ }
}, handler);

fastify.get("/external/status", {
  config: { documentRef: "external" },
  schema: { /* your schema */ }
}, handler);

await fastify.ready();

// Access documents
const internalDoc = fastify.getDocument("internal");
const externalDoc = fastify.getDocument("external");
```

## Features

- ✅ Multiple Swagger/OpenAPI documents in one app
- ✅ JSON and YAML format support
- ✅ Scalar API Reference integration
- ✅ Swagger UI integration
- ✅ TypeScript support
- ✅ Route-level document association
- ✅ Flexible route selection strategies
- ✅ Document-level authentication/hooks

## Configuration

### Plugin Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `documents` | `Array<DocumentConfig \| string>` | ✅ | Array of document configurations or documentRef strings |
| `defaultDocumentRef` | `string` | ❌ | Default documentRef for routes without explicit assignment |
| `routePrefix` | `string` | ❌ | Global prefix for all document routes (JSON/YAML endpoints) |

### Document Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `documentRef` | `string` | ✅ | Unique identifier for the document |
| `name` | `string` | ❌ | Display name for UI providers |
| `swaggerOptions` | `object` | ❌ | Configuration passed to [@fastify/swagger](https://github.com/fastify/fastify-swagger) |
| `urlPrefix` | `string \| string[]` | ❌ | URL prefix(es) to filter routes |
| `routeSelector` | `(routeOptions, url) => boolean` | ❌ | How to select routes |
| `exposeRoute` | `boolean \| object` | ❌ | Control JSON/YAML route exposure |
| `meta` | `object` | ❌ | Additional metadata for UI configuration |
| `hooks` | `object` | ❌ | Fastify hooks for document routes |

### Route Selection Strategies

| Strategy | Description | Example |
|----------|-------------|---------|
| **By Reference** | Routes specify `documentRef` in config | `config: { documentRef: "internal" }` |
| **By URL Prefix** | Routes starting with prefix are included | `urlPrefix: "/api/v1"` |
| **Custom Function** | Custom logic determines inclusion | `(routeOptions, url) => routeOptions.schema?.tags?.includes('public')` |

> **Note:** `routeSelector` and `urlPrefix` options cannot be used together. Please provide only one.

## Integration Examples

### With [Scalar API Reference](https://github.com/scalar/scalar/tree/main/integrations/fastify)

```javascript
import Scalar from "@scalar/fastify-api-reference";

await fastify.register(fastifyMultipleSwagger, {
  documents: [
    {
      documentRef: "api",
      name: "My API",
      meta: { default: true },
      swaggerOptions: {
        openapi: {
          info: { title: "My API", version: "1.0.0" }
        }
      }
    }
  ]
});

await fastify.register(Scalar, {
  routePrefix: "/docs",
  configuration: {
    sources: fastify.getDocumentSources({ scalar: true })
  }
});
```

### With [Swagger UI](https://github.com/fastify/fastify-swagger-ui)

```javascript
import SwaggerUI from "@fastify/swagger-ui";

await fastify.register(SwaggerUI, {
  routePrefix: "/docs", 
  uiConfig: {
    urls: fastify.getDocumentSources({ swaggerUI: true })
  }
});
```

### Route Selection Examples

**Using URL Prefix:**

```javascript
{
  documentRef: "v1",
  urlPrefix: "/api/v1"
}
```

**Using Custom Function:**

```javascript
{
  documentRef: "public",
  routeSelector: (routeOptions, url) => {
    return routeOptions.schema?.tags?.includes('public');
  }
}
```

### Document Authentication

Protect specific documents with authentication:

```javascript
import fastifyBasicAuth from "@fastify/basic-auth";

await fastify.register(fastifyBasicAuth, {
  validate: (username, password, req, reply, done) => {
    if (username === 'admin' && password === 'secret') {
      done();
    } else {
      done(new Error('Unauthorized'));
    }
  }
});

await fastify.register(fastifyMultipleSwagger, {
  documents: [
    {
      documentRef: "admin",
      hooks: {
        onRequest: fastify.basicAuth // Protect admin docs
      },
      swaggerOptions: {
        openapi: {
          info: { title: "Admin API", version: "1.0.0" }
        }
      }
    }
  ]
});
```

## API Reference

### `fastify.getDocument(documentRef, options?)`

Retrieve a Swagger document by reference.

**Parameters:**

- `documentRef` (string): Document identifier
- `options.yaml` (boolean): Return as YAML string instead of object

**Returns:** OpenAPI document object or YAML string

### `fastify.getDocumentSources(options?)`

Get document sources for UI integration.

**Parameters:**

- `options.scalar` (boolean): Return only Scalar-compatible sources
- `options.swaggerUI` (boolean): Return only Swagger UI-compatible sources

**Returns:** Array of document source objects

## Advanced Configuration

### Expose Route Control

```javascript
{
  documentRef: "api",
  exposeRoute: {
    json: true,
    yaml: false
  }
}
```

### Multiple URL Prefixes

```javascript
{
  documentRef: "admin",
  urlPrefix: ["/admin", "/management"]
}
```

## Contributing

Contributions are welcome!

## License

MIT
