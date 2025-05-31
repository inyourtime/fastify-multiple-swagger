import Scalar from '@scalar/fastify-api-reference'
import Fastify from 'fastify'
import fastifyMultipleSwagger from '../index.js'

const app = Fastify()

const internalOption = {
  documentRef: 'internal',
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
  documentRef: 'external',
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
  hooks: {
    onRequest: (req, reply, next) => {
      console.log('Internal onRequest')
      next()
    },
  },
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
