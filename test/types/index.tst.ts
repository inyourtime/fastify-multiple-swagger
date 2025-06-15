import Fastify from 'fastify'
import type { RouteOptions } from 'fastify'
import type { OpenAPI } from 'openapi-types'
import { expect } from 'tstyche'
import fastifyMultipleSwagger from '../..'
import type {
  DocumentConfig,
  DocumentSource,
  FastifyMultipleSwaggerOptions,
  ScalarSource,
  SwaggerUISource,
} from '../..'

const app = Fastify()

app.register(fastifyMultipleSwagger, { documents: [] })
app.register(fastifyMultipleSwagger, { documents: ['foo', 'bar'] })
app.register(fastifyMultipleSwagger, {
  documents: [{ documentRef: 'foo' }, { documentRef: 'bar' }],
})
app.register(fastifyMultipleSwagger, {
  documents: ['foo', { documentRef: 'bar' }],
})
app.register(fastifyMultipleSwagger, {
  documents: [
    {
      documentRef: 'foo',
      exposeRoute: false,
      routeSelector: 'ref',
      swaggerOptions: {
        openapi: {
          info: {
            title: 'foo',
            version: '1.0.0',
          },
        },
      },
    },
  ],
})
app.register(fastifyMultipleSwagger, {
  documents: [
    {
      documentRef: 'foo',
      exposeRoute: {
        json: true,
        yaml: false,
      },
      name: 'foo',
      meta: {
        default: true,
        slug: 'foo',
      },
      routeSelector: 'prefix',
      urlPrefix: '/api/v1',
    },
  ],
})
app.register(fastifyMultipleSwagger, {
  documents: [
    {
      documentRef: 'foo',
      routeSelector: 'prefix',
      urlPrefix: ['/foo', '/bar'],
      hooks: {
        onRequest: (req, _reply, done) => {
          expect<string>().type.toBe(req.url)
          done()
        },
        preHandler: async (req, _reply) => {
          expect<string>().type.toBe(req.url)
        },
      },
    },
  ],
})
app.register(fastifyMultipleSwagger, {
  documents: [
    {
      documentRef: 'foo',
      exposeRoute: {
        json: '/swagger.json',
        yaml: '/swagger.yaml',
      },
      routeSelector(routeOptions, url) {
        expect<string>().type.toBe(url)
        expect<RouteOptions>().type.toBe(routeOptions)
        return true
      },
    },
  ],
})
app.register(fastifyMultipleSwagger, {
  documents: ['foo', 'bar'],
  defaultDocumentRef: 'foo',
  routePrefix: '/docs',
})

const documentConfig: DocumentConfig = {
  documentRef: 'foo',
  exposeRoute: false,
  swaggerOptions: {
    openapi: {
      info: {
        title: 'foo',
        version: '1.0.0',
      },
    },
  },
}

const pluginOptions: FastifyMultipleSwaggerOptions = {
  documents: [documentConfig],
  defaultDocumentRef: 'foo',
  routePrefix: '/docs',
}

app.register(fastifyMultipleSwagger, pluginOptions)

app
  .register(fastifyMultipleSwagger, {
    documents: ['foo'],
  })
  .ready(() => {
    app.getDocumentSources()
  })

app.post(
  '/',
  {
    config: {
      documentRef: 'foo',
    },
  },
  () => {},
)

app.route({
  method: 'GET',
  url: '/full',
  config: {
    documentRef: 'foo',
  },
  handler: () => {},
})

expect(app.getDocumentSources()).type.toBe<Array<DocumentSource>>()
expect(app.getDocumentSources({ scalar: true })).type.toBe<Array<ScalarSource>>()
expect(app.getDocumentSources({ swaggerUI: true })).type.toBe<Array<SwaggerUISource>>()
expect(app.getDocumentSources).type.not.toBeCallableWith({ scalar: true, swaggerUI: true })
expect(app.getDocumentSources).type.not.toBeCallableWith({ scalar: false })

expect(app.getDocument).type.not.toBeCallableWith()
expect(app.getDocument('foo')).type.toBe<OpenAPI.Document>()
expect(app.getDocument('foo', { yaml: false })).type.toBe<OpenAPI.Document>()
expect(app.getDocument('foo', { yaml: true })).type.toBe<string>()
