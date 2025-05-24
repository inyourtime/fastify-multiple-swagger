'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const Swagger = require('@apidevtools/swagger-parser')
const yaml = require('yaml')

test('register plugin success', async (t) => {
  t.plan(1)
  const fastify = Fastify()

  await fastify.register(require('..'), { documents: [] })

  t.assert.ok(fastify.hasPlugin('fastify-multiple-swagger'))
})

test('should generate multiple documents #decorator', async (t) => {
  t.plan(8)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), { documents: ['foo', 'bar'] })

  fastify.get(
    '/foo',
    {
      schema: { querystring: { type: 'object', properties: { name: { type: 'string' } } } },
      config: {
        swaggerDecorator: 'foo',
      },
    },
    (req) => req.query,
  )

  fastify.get(
    '/bar',
    {
      schema: { querystring: { type: 'object', properties: { title: { type: 'string' } } } },
      config: {
        swaggerDecorator: 'bar',
      },
    },
    (req) => req.query,
  )

  await fastify.ready()

  const apiFoo = await Swagger.validate(fastify.foo())
  const apiBar = await Swagger.validate(fastify.bar())
  const definedPathFoo = apiFoo.paths['/foo']?.get
  const definedPathBar = apiBar.paths['/bar']?.get

  t.assert.ok(definedPathFoo)
  t.assert.ok(definedPathBar)
  t.assert.ifError(apiFoo.paths['/bar']?.get)
  t.assert.ifError(apiBar.paths['/foo']?.get)

  // assert json/yaml route
  t.assert.ok(fastify.hasRoute({ method: 'GET', url: '/doc-0/json' }))
  t.assert.ok(fastify.hasRoute({ method: 'GET', url: '/doc-0/yaml' }))
  t.assert.ok(fastify.hasRoute({ method: 'GET', url: '/doc-1/json' }))
  t.assert.ok(fastify.hasRoute({ method: 'GET', url: '/doc-1/yaml' }))
})

test('should generate multiple documents #endpoint', async (t) => {
  t.plan(5)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), { documents: ['foo', 'bar'] })

  fastify.get(
    '/foo',
    {
      schema: { querystring: { type: 'object', properties: { name: { type: 'string' } } } },
      config: {
        swaggerDecorator: 'foo',
      },
    },
    (req) => req.query,
  )

  fastify.get(
    '/bar',
    {
      schema: { querystring: { type: 'object', properties: { title: { type: 'string' } } } },
      config: {
        swaggerDecorator: 'bar',
      },
    },
    (req) => req.query,
  )

  await fastify.ready()

  const res1 = await fastify.inject({ method: 'GET', url: '/doc-0/json' })
  const res2 = await fastify.inject({ method: 'GET', url: '/doc-0/yaml' })
  const res3 = await fastify.inject({ method: 'GET', url: '/doc-1/json' })
  const res4 = await fastify.inject({ method: 'GET', url: '/doc-1/yaml' })

  const apiFoo = await Swagger.validate(res1.json())
  const apiBar = await Swagger.validate(res3.json())
  const definedPathFoo = apiFoo.paths['/foo']?.get
  const definedPathBar = apiBar.paths['/bar']?.get
  t.assert.ok(definedPathFoo)
  t.assert.ok(definedPathBar)
  t.assert.ifError(apiFoo.paths['/bar']?.get)
  t.assert.ifError(apiBar.paths['/foo']?.get)

  yaml.parse(res2.body)
  yaml.parse(res4.body)
  t.assert.ok(true, 'valid swagger yaml')
})

test('invalid "documents" option #1', async (t) => {
  t.plan(2)
  const fastify = Fastify()

  try {
    await fastify.register(require('..'), { documents: 'foo' })
  } catch (err) {
    t.assert.ok(err)
    t.assert.strictEqual(err.message, '"documents" option must be an array')
  }
})

test('invalid "documents" option #2', async (t) => {
  t.plan(2)
  const fastify = Fastify()

  try {
    await fastify.register(require('..'), { documents: [1, 2] })
  } catch (err) {
    t.assert.ok(err)
    t.assert.strictEqual(err.message, '"documents" option must be an array of objects or strings')
  }
})

test('"exposeRoute" option is false', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), { documents: [{ decorator: 'foo', exposeRoute: false }] })

  await fastify.ready()

  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/doc-0/json' }), false)
  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/doc-0/yaml' }), false)
})

test('"exposeRoute" option is object', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [{ decorator: 'foo', exposeRoute: { json: false, yaml: true } }],
  })

  await fastify.ready()

  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/doc-0/json' }), false)
  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/doc-0/yaml' }), true)
})

test('"exposeRoute" option with route url', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [
      { decorator: 'foo', exposeRoute: { json: '/swagger.json', yaml: '/swagger.yaml' } },
    ],
  })

  await fastify.ready()

  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/swagger.json' }), true)
  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/swagger.yaml' }), true)
})

test('provide "routePrefix" option', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [
      { decorator: 'foo', exposeRoute: { json: '/swagger.json', yaml: '/swagger.yaml' } },
    ],
    routePrefix: '/docs',
  })

  await fastify.ready()

  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/docs/swagger.json' }), true)
  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/docs/swagger.yaml' }), true)
})

test('invalid "decorator" option', async (t) => {
  t.plan(2)
  const fastify = Fastify()

  try {
    await fastify.register(require('..'), { documents: [{ decorator: null }] })
  } catch (err) {
    t.assert.ok(err)
    t.assert.strictEqual(err.message, '"decorator" option must be a string')
  }
})

test('duplicate "decorator" option', async (t) => {
  t.plan(2)
  const fastify = Fastify()

  try {
    await fastify.register(require('..'), {
      documents: [{ decorator: 'foo' }, { decorator: 'foo' }],
    })
  } catch (err) {
    t.assert.ok(err)
    t.assert.strictEqual(err.message, 'Swagger decorator "foo" already exists')
  }
})

test('invalid "defaultDecorator" option', async (t) => {
  t.plan(2)
  const fastify = Fastify()

  try {
    await fastify.register(require('..'), {
      documents: [{ decorator: 'foo' }],
      defaultDecorator: true,
    })
  } catch (err) {
    t.assert.ok(err)
    t.assert.strictEqual(err.message, '"defaultDecorator" option must be a string')
  }
})

test('should work with "defaultDecorator"', async (t) => {
  t.plan(1)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [{ decorator: 'foo' }, { decorator: 'bar' }],
    defaultDecorator: 'foo',
  })

  fastify.get(
    '/foo',
    {
      schema: { querystring: { type: 'object', properties: { name: { type: 'string' } } } },
    },
    (req) => req.query,
  )

  await fastify.ready()

  const apiFoo = await Swagger.validate(fastify.foo())
  const definedPathFoo = apiFoo.paths['/foo']?.get
  t.assert.ok(definedPathFoo)
})

test('should work with swagger transform', async (t) => {
  t.plan(4)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [
      {
        decorator: 'foo',
        swaggerOptions: {
          transform: (args) => {
            t.assert.ok(args.url)
            t.assert.ok(args.route)
            return { schema: args.schema, url: args.url }
          },
        },
      },
    ],
  })

  await fastify.ready()
  await Swagger.validate(fastify.foo())
})

test('should have decorator getDocumentSources', async (t) => {
  t.plan(3)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [
      { decorator: 'foo', exposeRoute: { json: '/swagger.json', yaml: '/swagger.yaml' } },
    ],
  })

  await fastify.ready()

  const source = fastify.getDocumentSources()[0]
  t.assert.strictEqual(source.decorator, 'foo')
  t.assert.strictEqual(source.json, '/swagger.json')
  t.assert.strictEqual(source.yaml, '/swagger.yaml')
})

test('routePrefix end with slash', async (t) => {
  t.plan(5)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [
      { decorator: 'foo', exposeRoute: { json: '/swagger.json', yaml: '/swagger.yaml' } },
    ],
    routePrefix: '/docs/',
  })

  await fastify.ready()

  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/docs/swagger.json' }), true)
  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/docs/swagger.yaml' }), true)

  const source = fastify.getDocumentSources()[0]
  t.assert.strictEqual(source.decorator, 'foo')
  t.assert.strictEqual(source.json, '/docs/swagger.json')
  t.assert.strictEqual(source.yaml, '/docs/swagger.yaml')
})

test('getDocumentSources with no exposeRoute', async (t) => {
  t.plan(5)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [{ decorator: 'foo', exposeRoute: false }],
  })

  await fastify.ready()

  await Swagger.validate(fastify.foo())

  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/doc-0/json' }), false)
  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/doc-0/yaml' }), false)

  const source = fastify.getDocumentSources()[0]
  t.assert.strictEqual(source.decorator, 'foo')
  t.assert.strictEqual(source.json, null)
  t.assert.strictEqual(source.yaml, null)
})

test('getDocumentSources with scalar option', async (t) => {
  t.plan(7)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [
      {
        decorator: 'foo',
        exposeRoute: { json: '/foo/swagger.json', yaml: '/foo/swagger.yaml' },
        name: "Foo's API",
        meta: {
          slug: 'foo',
          default: true,
        },
      },
      {
        decorator: 'bar',
        exposeRoute: { json: '/bar/swagger.json', yaml: '/bar/swagger.yaml' },
      },
    ],
  })

  await fastify.ready()

  const sources = fastify.getDocumentSources({ scalar: true })
  t.assert.strictEqual(sources[0].url, '/foo/swagger.json')
  t.assert.strictEqual(sources[0].title, "Foo's API")
  t.assert.strictEqual(sources[0].slug, 'foo')
  t.assert.strictEqual(sources[0].default, true)
  t.assert.strictEqual(sources[1].url, '/bar/swagger.json')
  t.assert.strictEqual(sources[1].title, undefined)
  t.assert.strictEqual(sources[1].slug, undefined)
})

test('getDocumentSources with swaggerUI option', async (t) => {
  t.plan(4)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [
      {
        decorator: 'foo',
        exposeRoute: { json: '/foo/swagger.json', yaml: '/foo/swagger.yaml' },
        name: "Foo's API",
      },
      {
        decorator: 'bar',
        exposeRoute: { json: '/bar/swagger.json', yaml: '/bar/swagger.yaml' },
      },
    ],
  })

  await fastify.ready()

  const sources = fastify.getDocumentSources({ swaggerUI: true })
  t.assert.strictEqual(sources[0].url, '/foo/swagger.json')
  t.assert.strictEqual(sources[0].name, "Foo's API")
  t.assert.strictEqual(sources[1].url, '/bar/swagger.json')
  t.assert.strictEqual(sources[1].name, undefined)
})

test('getDocumentSources with invalid option', async (t) => {
  t.plan(7)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [
      {
        decorator: 'foo',
        exposeRoute: { json: '/foo/swagger.json', yaml: '/foo/swagger.yaml' },
        name: "Foo's API",
      },
      {
        decorator: 'bar',
        exposeRoute: { json: '/bar/swagger.json', yaml: '/bar/swagger.yaml' },
      },
    ],
  })

  await fastify.ready()

  const sources = fastify.getDocumentSources({ swaggerUI: false })
  t.assert.strictEqual(sources.length, 2)
  t.assert.strictEqual(sources[0].decorator, 'foo')
  t.assert.strictEqual(sources[0].json, '/foo/swagger.json')
  t.assert.strictEqual(sources[0].yaml, '/foo/swagger.yaml')
  t.assert.strictEqual(sources[1].decorator, 'bar')
  t.assert.strictEqual(sources[1].json, '/bar/swagger.json')
  t.assert.strictEqual(sources[1].yaml, '/bar/swagger.yaml')
})
