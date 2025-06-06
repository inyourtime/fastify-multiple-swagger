'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')

test('should work with hook', async (t) => {
  t.plan(7)
  const fastify = Fastify()
  t.after(() => fastify.close())

  let hit = 0

  await fastify.register(require('..'), {
    documents: [
      {
        documentRef: 'foo',
        hooks: {
          onRequest: (req, _reply, done) => {
            t.assert.strictEqual(req.url, '/doc-0/json')
            t.assert.strictEqual(hit++, 0)
            done()
          },
          preHandler: (req, _reply, done) => {
            t.assert.strictEqual(req.url, '/doc-0/json')
            t.assert.strictEqual(hit++, 1)
            done()
          },
        },
      },
      {
        documentRef: 'bar',
      },
    ],
  })

  await fastify.ready()

  const res = await fastify.inject({
    method: 'GET',
    url: '/doc-0/json',
  })
  const res2 = await fastify.inject({
    method: 'GET',
    url: '/doc-1/json',
  })

  t.assert.strictEqual(res.statusCode, 200)
  t.assert.strictEqual(hit, 2)
  t.assert.strictEqual(res2.statusCode, 200)
})
