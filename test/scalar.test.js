'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const Scalar = require('@scalar/fastify-api-reference')

test('should work with scalar #default config', async (t) => {
  t.plan(5)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [{ documentRef: 'swagger1' }, { documentRef: 'swagger2' }],
  })

  await fastify.register(Scalar, {
    routePrefix: '/reference',
    configuration: {
      sources: fastify.getDocumentSources({ scalar: true }),
    },
  })

  await fastify.ready()
  const address = await fastify.listen({ port: 0, host: '0.0.0.0' })
  const response = await fetch(`${address}/reference`)
  t.assert.strictEqual(response.status, 200)
  t.assert.strictEqual(response.headers.get('content-type'), 'text/html; charset=utf-8')

  const responseText = await response.text()
  t.assert.match(responseText, /<title>Scalar API Reference<\/title>/)
  t.assert.match(responseText, /"url": "\/doc-0\/json"/)
  t.assert.match(responseText, /"url": "\/doc-1\/json"/)
})

test('should work with scalar #custom config', async (t) => {
  t.plan(8)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [
      {
        documentRef: 'swagger1',
        exposeRoute: { json: '/swagger1.json' },
        name: 'Swagger 1',
        meta: { default: true },
      },
      {
        documentRef: 'swagger2',
        exposeRoute: { json: '/swagger2.json' },
        meta: { slug: 'swagger-2' },
      },
    ],
  })

  await fastify.register(Scalar, {
    routePrefix: '/reference',
    configuration: {
      sources: fastify.getDocumentSources({ scalar: true }),
    },
  })

  await fastify.ready()
  const address = await fastify.listen({ port: 0, host: '0.0.0.0' })
  const response = await fetch(`${address}/reference`)
  t.assert.strictEqual(response.status, 200)
  t.assert.strictEqual(response.headers.get('content-type'), 'text/html; charset=utf-8')

  const responseText = await response.text()
  t.assert.match(responseText, /<title>Scalar API Reference<\/title>/)
  t.assert.match(responseText, /"url": "\/swagger1\.json"/)
  t.assert.match(responseText, /"url": "\/swagger2\.json"/)
  t.assert.match(responseText, /"slug": "swagger-2"/)
  t.assert.match(responseText, /"title": "Swagger 1"/)
  t.assert.match(responseText, /"default": true/)
})
