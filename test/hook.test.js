'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')

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

function basicAuthEncode(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
}

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

test('returns 200 OK for protected route with basic auth', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('@fastify/basic-auth'), authOptions)

  await fastify.register(require('..'), {
    documents: [
      {
        documentRef: 'foo',
        hooks: {
          onRequest: fastify.basicAuth,
        },
      },
      {
        documentRef: 'bar',
      },
    ],
  })

  const protectedRes = await fastify.inject({
    method: 'GET',
    url: '/doc-0/json',
    headers: {
      authorization: basicAuthEncode('admin', 'admin'),
    },
  })
  const unprotectedRes = await fastify.inject({
    method: 'GET',
    url: '/doc-1/json',
  })

  t.assert.strictEqual(protectedRes.statusCode, 200)
  t.assert.strictEqual(unprotectedRes.statusCode, 200)
})

test('returns 401 for protected route with basic auth', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('@fastify/basic-auth'), authOptions)

  await fastify.register(require('..'), {
    documents: [
      {
        documentRef: 'foo',
        hooks: {
          onRequest: fastify.basicAuth,
        },
      },
      {
        documentRef: 'bar',
      },
    ],
  })

  const protectedRes = await fastify.inject({
    method: 'GET',
    url: '/doc-0/json',
    headers: {
      authorization: basicAuthEncode('admin', 'wrong'),
    },
  })
  const unprotectedRes = await fastify.inject({
    method: 'GET',
    url: '/doc-1/json',
  })

  t.assert.strictEqual(protectedRes.statusCode, 401)
  t.assert.strictEqual(unprotectedRes.statusCode, 200)
})
