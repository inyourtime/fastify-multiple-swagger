import Fastify from 'fastify'
import fastifyMultipleSwagger from '../index.js'

const app = Fastify()

await app.register(fastifyMultipleSwagger, {
  documents: [
    {
      documentRef: 'v1',
      swaggerOptions: {
        openapi: {
          info: {
            title: 'v1',
            version: '1.0.0',
          },
        },
      },
    },
    {
      documentRef: 'v2',
      swaggerOptions: {
        openapi: {
          info: {
            title: 'v2',
            version: '1.0.0',
          },
        },
      },
    },
  ],
})

app.get('/api/v1/hello', { config: { documentRef: 'v1' } }, () => 'hello v1')
app.get('/api/v2/hello', { config: { documentRef: 'v2' } }, () => 'hello v2')

await app.ready()

console.log(app.getDocument('v1'))
console.log(app.getDocument('v2'))
