import Fastify from 'fastify'
import Scalar from '@scalar/fastify-api-reference'
import fastifyMultipleSwagger from '../index.js'

const app = Fastify()

const internalOption = {
  decorator: 'internal',
  swaggerOptions: {
    openapi: {
      info: {
        title: 'Internal',
        version: '1.0.0',
      },
    },
  },
  name: 'Internal',
}

const externalOption = {
  decorator: 'external',
  swaggerOptions: {
    openapi: {
      info: {
        title: 'External',
        version: '1.0.0',
      },
    },
  },
  name: 'External',
  meta: {
    default: true,
  },
}

await app.register(fastifyMultipleSwagger, {
  documents: [internalOption, externalOption],
})

await app.register(Scalar, {
  routePrefix: '/reference',
  configuration: {
    sources: app.getDocumentSources({ scalar: true }),
  },
})

app.register(import('./routes/internal.mjs'), { prefix: '/internal' })
app.register(import('./routes/external.mjs'), { prefix: '/external' })

await app.listen({ port: 3000 })
