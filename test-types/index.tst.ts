import type { FastifyContextConfig, RouteOptions } from 'fastify'
import Fastify from 'fastify'
import type { OpenAPI } from 'openapi-types'
import { expect } from 'tstyche'
import type {
  DocumentConfig,
  DocumentSource,
  FastifyMultipleSwaggerOptions,
  ScalarSource,
  SwaggerUISource,
} from '..'
import fastifyMultipleSwagger from '..'

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
      urlPrefix: '/api/v1',
    },
  ],
})
app.register(fastifyMultipleSwagger, {
  documents: [
    {
      documentRef: 'foo',
      urlPrefix: ['/foo', '/bar'],
      hooks: {
        onRequest: (req, _reply, done) => {
          expect(req.url).type.toBe<string>()
          done()
        },
        preHandler: async (req, _reply) => {
          expect(req.url).type.toBe<string>()
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
        expect(url).type.toBe<string>()
        expect(routeOptions).type.toBe<RouteOptions>()
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

expect(app).type.toHaveProperty('getDocumentSources')
expect(app).type.toHaveProperty('getDocument')

expect(app.getDocumentSources()).type.toBe<Array<DocumentSource>>()
expect(app.getDocumentSources({ scalar: true })).type.toBe<Array<ScalarSource>>()
expect(app.getDocumentSources({ swaggerUI: true })).type.toBe<Array<SwaggerUISource>>()
expect(app.getDocumentSources).type.not.toBeCallableWith({
  scalar: true,
  swaggerUI: true,
})
expect(app.getDocumentSources).type.not.toBeCallableWith({ scalar: false })

expect(app.getDocument).type.not.toBeCallableWith()
expect(app.getDocument('foo')).type.toBe<OpenAPI.Document>()
expect(app.getDocument('foo', { yaml: false })).type.toBe<OpenAPI.Document>()
expect(app.getDocument('foo', { yaml: true })).type.toBe<string>()

expect({
  documentRef: 'foo',
  routeSelector: 'ref',
}).type.not.toBeAssignableTo<DocumentConfig>()
expect({
  documentRef: 'foo',
  routeSelector: 'prefix',
}).type.not.toBeAssignableTo<DocumentConfig>()
expect({
  documentRef: 'foo',
  routeSelector: () => true,
}).type.toBeAssignableTo<DocumentConfig>()

expect({ documentRef: true }).type.not.toBeAssignableTo<FastifyContextConfig>()
expect({ documentRef: 'foo' }).type.toBeAssignableTo<FastifyContextConfig>()
expect({
  documentRef: ['foo', 'bar'],
}).type.toBeAssignableTo<FastifyContextConfig>()
