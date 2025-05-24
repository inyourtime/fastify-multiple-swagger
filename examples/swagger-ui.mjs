import SwaggerUI from '@fastify/swagger-ui'
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
}

await app.register(fastifyMultipleSwagger, {
  documents: [internalOption, externalOption],
})

await app.register(SwaggerUI, {
  routePrefix: '/reference',
  uiConfig: {
    urls: app.getDocumentSources({ swaggerUI: true }),
  },
})

app.register(import('./routes/internal.mjs'), { prefix: '/internal' })
app.register(import('./routes/external.mjs'), { prefix: '/external' })

await app.listen({ port: 3000 })
