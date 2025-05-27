'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const SwaggerUI = require('@fastify/swagger-ui')

test('should work with swagger-ui #default config', async (t) => {
  t.plan(4)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [{ documentRef: 'swagger1' }, { documentRef: 'swagger2' }],
  })

  await fastify.register(SwaggerUI, {
    routePrefix: '/reference',
    uiConfig: { urls: fastify.getDocumentSources({ swaggerUI: true }) },
  })

  await fastify.ready()
  const address = await fastify.listen({ port: 0, host: '0.0.0.0' })
  const response = await fetch(`${address}/reference/static/swagger-initializer.js`)
  t.assert.strictEqual(response.status, 200)
  t.assert.strictEqual(
    response.headers.get('content-type'),
    'application/javascript; charset=utf-8',
  )

  const responseText = await response.text()
  t.assert.match(responseText, /"url":"\/doc-0\/json"/)
  t.assert.match(responseText, /"url":"\/doc-1\/json"/)
})

test('should work with swagger-ui #custom config', async (t) => {
  t.plan(6)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [
      {
        documentRef: 'swagger1',
        exposeRoute: { json: '/swagger1.json' },
        name: 'Swagger 1',
        meta: {},
      },
      {
        documentRef: 'swagger2',
        exposeRoute: { json: '/swagger2.json' },
        name: 'Swagger 2',
        meta: {},
      },
    ],
  })

  await fastify.register(SwaggerUI, {
    routePrefix: '/reference',
    uiConfig: { urls: fastify.getDocumentSources({ swaggerUI: true }) },
  })

  await fastify.ready()
  const address = await fastify.listen({ port: 0, host: '0.0.0.0' })
  const response = await fetch(`${address}/reference/static/swagger-initializer.js`)
  t.assert.strictEqual(response.status, 200)
  t.assert.strictEqual(
    response.headers.get('content-type'),
    'application/javascript; charset=utf-8',
  )

  const responseText = await response.text()

  t.assert.match(responseText, /"url":"\/swagger1\.json"/)
  t.assert.match(responseText, /"url":"\/swagger2\.json"/)
  t.assert.match(responseText, /"name":"Swagger 1"/)
  t.assert.match(responseText, /"name":"Swagger 2"/)
})
