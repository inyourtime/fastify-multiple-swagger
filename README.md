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
import Fastify from 'fastify'
import fastifyMultipleSwagger from 'fastify-multiple-swagger'

const app = Fastify()

await app.register(fastifyMultipleSwagger, {
  documents: [
    {
      documentRef: 'internal',
      swaggerOptions: {
        openapi: {
          info: {
            title: 'Internal API',
            version: '1.0.0'
          }
        }
      }
    },
    {
      documentRef: 'external',
      swaggerOptions: {
        openapi: {
          info: {
            title: 'External API',
            version: '1.0.0'
          }
        }
      }
    }
  ]
})
```

### Route Configuration

To associate routes with specific Swagger documents, use the `documentRef` in the route configuration:

```javascript
app.get('/internal/route', {
  schema: {
    // Your schema definition
  },
  config: {
    documentRef: 'internal'
  }
}, handler)

app.get('/external/route', {
  schema: {
    // Your schema definition
  },
  config: {
    documentRef: 'external'
  }
}, handler)
```

### Integration with Scalar API Reference

```javascript
import Scalar from '@scalar/fastify-api-reference'

await app.register(fastifyMultipleSwagger, {
  documents: [
    {
      documentRef: 'internal',
      name: 'Internal API',
      meta: {
        default: true
      },
      swaggerOptions: {
        openapi: {
          info: {
            title: 'Internal API',
            version: '1.0.0'
          }
        }
      }
    }
  ]
})

await app.register(Scalar, {
  routePrefix: '/reference',
  configuration: {
    sources: app.getDocumentSources({ scalar: true })
  }
})
```

### Integration with Swagger UI

```javascript
import SwaggerUI from '@fastify/swagger-ui'

await app.register(fastifyMultipleSwagger, {
  documents: [
    {
      documentRef: 'internal',
      name: 'Internal API',
      swaggerOptions: {
        openapi: {
          info: {
            title: 'Internal API',
            version: '1.0.0'
          }
        }
      }
    }
  ]
})

await app.register(SwaggerUI, {
  routePrefix: '/reference',
  uiConfig: {
    urls: app.getDocumentSources({ swaggerUI: true })
  }
})
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

The plugin adds a `getDocumentSources` method to the Fastify instance with the following options:

- `{ scalar: true }`: Returns sources formatted for Scalar API Reference
- `{ swaggerUI: true }`: Returns sources formatted for Swagger UI
- No options: Returns raw document sources

## License

MIT