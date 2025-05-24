import Fastify from 'fastify'
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
