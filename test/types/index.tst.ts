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

expect<Array<DocumentSource>>().type.toBe(app.getDocumentSources())
expect<Array<ScalarSource>>().type.toBe(app.getDocumentSources({ scalar: true }))
expect<Array<SwaggerUISource>>().type.toBe(app.getDocumentSources({ swaggerUI: true }))
expect(app.getDocumentSources({ scalar: true, swaggerUI: true })).type.toRaiseError()
expect(app.getDocumentSources({ scalar: false })).type.toRaiseError()

expect(app.getDocument()).type.toRaiseError()
expect<OpenAPI.Document>().type.toBe(app.getDocument('foo'))
expect<OpenAPI.Document>().type.toBe(app.getDocument('foo', { yaml: false }))
expect<string>().type.toBe(app.getDocument('foo', { yaml: true }))
