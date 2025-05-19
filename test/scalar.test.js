'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')

test('should work with scalar #default config', async (t) => {
  t.plan(5)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [{ decorator: 'swagger1' }, { decorator: 'swagger2' }],
  })

  const Scalar = await import('@scalar/fastify-api-reference')
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
  t.plan(7)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [
      {
        decorator: 'swagger1',
        exposeRoute: { json: '/swagger1.json' },
        meta: { title: 'Swagger 1' },
      },
      {
        decorator: 'swagger2',
        exposeRoute: { json: '/swagger2.json' },
        meta: { slug: 'swagger-2' },
      },
    ],
  })

  const Scalar = await import('@scalar/fastify-api-reference')
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
})
