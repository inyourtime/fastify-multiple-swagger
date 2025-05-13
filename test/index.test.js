'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')

test('test', async () => {
  const fastify = Fastify()

  await fastify.register(require('..'), {
    documents: [
      {
        decorator: 'swagger1',
        swaggerOptions: {
          openapi: {
            info: {
              title: 'test',
              version: '1.0.0',
            },
          },
        },
      },
      {
        decorator: 'swagger2',
      },
    ],
    defaultDecorator: 'swagger1',
    addRoute: false,
  })

  fastify.get('/', () => {
    return 'hello'
  })

  await fastify.ready()

  console.log(fastify.swagger1())
  console.log(fastify.swagger2())
  console.log(fastify.printRoutes())
})
