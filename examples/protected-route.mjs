import fastifyBasicAuth from '@fastify/basic-auth'
import Scalar from '@scalar/fastify-api-reference'
import Fastify from 'fastify'
import fastifyMultipleSwagger from '../index.js'

const app = Fastify()

const authOptions = {
  validate(username, password, _req, _reply, done) {
    if (username === 'admin' && password === 'admin') {
      done()
    } else {
      done(new Error('Invalid credentials'))
    }
  },
  authenticate: true,
}

await app.register(fastifyBasicAuth, authOptions)

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
  hooks: {
    onRequest: app.basicAuth,
  },
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
