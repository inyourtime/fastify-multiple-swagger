'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')

test('register plugin success', async (t) => {
  const fastify = Fastify({ logger: true })

  await fastify.register(require('..'), {
    documents: [],
  })

  t.assert.ok(fastify.hasPlugin('fastify-multiple-swagger'))
})
