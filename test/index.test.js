'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const Swagger = require('@apidevtools/swagger-parser')
const yaml = require('yaml')
const { getDecoratorName } = require('../lib/utils')

test('register plugin success', async (t) => {
  t.plan(1)
  const fastify = Fastify()

  await fastify.register(require('..'), { documents: [] })

  t.assert.ok(fastify.hasPlugin('fastify-multiple-swagger'))
})

test('should generate multiple documents #documentRef', async (t) => {
  t.plan(8)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), { documents: ['foo', 'bar'] })

  fastify.get(
    '/foo',
    {
      schema: { querystring: { type: 'object', properties: { name: { type: 'string' } } } },
      config: {
        documentRef: 'foo',
      },
    },
    (req) => req.query,
  )

  fastify.get(
    '/bar',
    {
      schema: { querystring: { type: 'object', properties: { title: { type: 'string' } } } },
      config: {
        documentRef: 'bar',
      },
    },
    (req) => req.query,
  )

  await fastify.ready()

  const apiFoo = await Swagger.validate(fastify[getDecoratorName('foo')]())
  const apiBar = await Swagger.validate(fastify[getDecoratorName('bar')]())
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
        documentRef: 'foo',
      },
    },
    (req) => req.query,
  )

  fastify.get(
    '/bar',
    {
      schema: { querystring: { type: 'object', properties: { title: { type: 'string' } } } },
      config: {
        documentRef: 'bar',
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

  await fastify.register(require('..'), { documents: [{ documentRef: 'foo', exposeRoute: false }] })

  await fastify.ready()

  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/doc-0/json' }), false)
  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/doc-0/yaml' }), false)
})

test('"exposeRoute" option is object', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [{ documentRef: 'foo', exposeRoute: { json: false, yaml: true } }],
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
      { documentRef: 'foo', exposeRoute: { json: '/swagger.json', yaml: '/swagger.yaml' } },
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
      { documentRef: 'foo', exposeRoute: { json: '/swagger.json', yaml: '/swagger.yaml' } },
    ],
    routePrefix: '/docs',
  })

  await fastify.ready()

  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/docs/swagger.json' }), true)
  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/docs/swagger.yaml' }), true)
})

test('invalid "documentRef" option', async (t) => {
  t.plan(2)
  const fastify = Fastify()

  try {
    await fastify.register(require('..'), { documents: [{ documentRef: null }] })
  } catch (err) {
    t.assert.ok(err)
    t.assert.strictEqual(err.message, '"documentRef" option must be a string')
  }
})

test('duplicate "documentRef" option', async (t) => {
  t.plan(2)
  const fastify = Fastify()

  try {
    await fastify.register(require('..'), {
      documents: [{ documentRef: 'foo' }, { documentRef: 'foo' }],
    })
  } catch (err) {
    t.assert.ok(err)
    t.assert.strictEqual(err.message, 'documentRef "foo" already exists')
  }
})

test('invalid "defaultDocumentRef" option', async (t) => {
  t.plan(2)
  const fastify = Fastify()

  try {
    await fastify.register(require('..'), {
      documents: [{ documentRef: 'foo' }],
      defaultDocumentRef: true,
    })
  } catch (err) {
    t.assert.ok(err)
    t.assert.strictEqual(err.message, '"defaultDocumentRef" option must be a string')
  }
})

test('should work with "defaultDocumentRef"', async (t) => {
  t.plan(1)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [{ documentRef: 'foo' }, { documentRef: 'bar' }],
    defaultDocumentRef: 'foo',
  })

  fastify.get(
    '/foo',
    {
      schema: { querystring: { type: 'object', properties: { name: { type: 'string' } } } },
    },
    (req) => req.query,
  )

  await fastify.ready()

  const apiFoo = await Swagger.validate(fastify[getDecoratorName('foo')]())
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
        documentRef: 'foo',
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
  await Swagger.validate(fastify[getDecoratorName('foo')]())
})

test('should have decorator getDocumentSources', async (t) => {
  t.plan(3)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [
      { documentRef: 'foo', exposeRoute: { json: '/swagger.json', yaml: '/swagger.yaml' } },
    ],
  })

  await fastify.ready()

  const source = fastify.getDocumentSources()[0]
  t.assert.strictEqual(source.documentRef, 'foo')
  t.assert.strictEqual(source.json, '/swagger.json')
  t.assert.strictEqual(source.yaml, '/swagger.yaml')
})

test('routePrefix end with slash', async (t) => {
  t.plan(5)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [
      { documentRef: 'foo', exposeRoute: { json: '/swagger.json', yaml: '/swagger.yaml' } },
    ],
    routePrefix: '/docs/',
  })

  await fastify.ready()

  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/docs/swagger.json' }), true)
  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/docs/swagger.yaml' }), true)

  const source = fastify.getDocumentSources()[0]
  t.assert.strictEqual(source.documentRef, 'foo')
  t.assert.strictEqual(source.json, '/docs/swagger.json')
  t.assert.strictEqual(source.yaml, '/docs/swagger.yaml')
})

test('getDocumentSources with no exposeRoute', async (t) => {
  t.plan(5)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [{ documentRef: 'foo', exposeRoute: false }],
  })

  await fastify.ready()

  await Swagger.validate(fastify[getDecoratorName('foo')]())

  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/doc-0/json' }), false)
  t.assert.strictEqual(fastify.hasRoute({ method: 'GET', url: '/doc-0/yaml' }), false)

  const source = fastify.getDocumentSources()[0]
  t.assert.strictEqual(source.documentRef, 'foo')
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
        documentRef: 'foo',
        exposeRoute: { json: '/foo/swagger.json', yaml: '/foo/swagger.yaml' },
        name: "Foo's API",
        meta: {
          slug: 'foo',
          default: true,
        },
      },
      {
        documentRef: 'bar',
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
        documentRef: 'foo',
        exposeRoute: { json: '/foo/swagger.json', yaml: '/foo/swagger.yaml' },
        name: "Foo's API",
      },
      {
        documentRef: 'bar',
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
        documentRef: 'foo',
        exposeRoute: { json: '/foo/swagger.json', yaml: '/foo/swagger.yaml' },
        name: "Foo's API",
      },
      {
        documentRef: 'bar',
        exposeRoute: { json: '/bar/swagger.json', yaml: '/bar/swagger.yaml' },
      },
    ],
  })

  await fastify.ready()

  const sources = fastify.getDocumentSources({ swaggerUI: false })
  t.assert.strictEqual(sources.length, 2)
  t.assert.strictEqual(sources[0].documentRef, 'foo')
  t.assert.strictEqual(sources[0].json, '/foo/swagger.json')
  t.assert.strictEqual(sources[0].yaml, '/foo/swagger.yaml')
  t.assert.strictEqual(sources[1].documentRef, 'bar')
  t.assert.strictEqual(sources[1].json, '/bar/swagger.json')
  t.assert.strictEqual(sources[1].yaml, '/bar/swagger.yaml')
})

test('getDocument with valid documentRef', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: ['foo', 'bar'],
  })

  await fastify.ready()

  const specFoo = fastify.getDocument('foo')
  const specBar = fastify.getDocument('bar')
  await Swagger.validate(specFoo)
  await Swagger.validate(specBar)
  t.assert.ok(specFoo.swagger)
  t.assert.ok(specBar.swagger)
})

test('getDocument with invalid documentRef', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: ['foo', 'bar'],
  })

  await fastify.ready()
  try {
    fastify.getDocument()
  } catch (error) {
    t.assert.strictEqual(error.message, '"documentRef" must be a string')
  }

  try {
    fastify.getDocument('baz')
  } catch (error) {
    t.assert.strictEqual(error.message, 'documentRef "baz" does not exist')
  }
})

test('getDocument with YAML option', async (t) => {
  t.plan(1)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: ['foo'],
  })

  await fastify.ready()

  const specYaml = fastify.getDocument('foo', { yaml: true })
  const specJson = yaml.parse(specYaml)

  await Swagger.validate(specJson)
  t.assert.ok(specJson.swagger)
})

test('routeSelector with "ref"', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [{ documentRef: 'foo', routeSelector: 'ref' }],
  })

  fastify.get(
    '/foo',
    {
      schema: { querystring: { type: 'object', properties: { name: { type: 'string' } } } },
      config: {
        documentRef: 'foo',
      },
    },
    (req) => req.query,
  )

  fastify.get(
    '/bar',
    {
      schema: { querystring: { type: 'object', properties: { name: { type: 'string' } } } },
      config: {
        documentRef: 'bar',
      },
    },
    (req) => req.query,
  )

  await fastify.ready()

  const apiFoo = await Swagger.validate(fastify[getDecoratorName('foo')]())
  const definedPathFoo = apiFoo.paths['/foo']?.get
  const definedPathBar = apiFoo.paths['/bar']?.get

  t.assert.ok(definedPathFoo)
  t.assert.strictEqual(definedPathBar, undefined)
})

test('routeSelector with "prefix"', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [{ documentRef: 'foo', routeSelector: 'prefix', urlPrefix: '/foo' }],
  })

  fastify.get(
    '/foo',
    {
      schema: { querystring: { type: 'object', properties: { name: { type: 'string' } } } },
    },
    (req) => req.query,
  )

  fastify.get(
    '/bar',
    {
      schema: { querystring: { type: 'object', properties: { name: { type: 'string' } } } },
    },
    (req) => req.query,
  )

  await fastify.ready()

  const apiFoo = await Swagger.validate(fastify[getDecoratorName('foo')]())
  const definedPathFoo = apiFoo.paths['/foo']?.get
  const definedPathBar = apiFoo.paths['/bar']?.get

  t.assert.ok(definedPathFoo)
  t.assert.strictEqual(definedPathBar, undefined)
})

test('routeSelector with custom function', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [
      {
        documentRef: 'foo',
        routeSelector: (route, url) => {
          return url.startsWith('/foo') && route.config?.documentRef === 'foo'
        },
      },
    ],
  })

  fastify.get(
    '/foo/ref',
    {
      schema: { querystring: { type: 'object', properties: { name: { type: 'string' } } } },
      config: { documentRef: 'foo' },
    },
    (req) => req.query,
  )

  fastify.get(
    '/foo',
    {
      schema: { querystring: { type: 'object', properties: { name: { type: 'string' } } } },
    },
    (req) => req.query,
  )

  await fastify.ready()

  const apiFoo = await Swagger.validate(fastify[getDecoratorName('foo')]())
  const definedPathFooRef = apiFoo.paths['/foo/ref']?.get
  const definedPathFoo = apiFoo.paths['/foo']?.get

  t.assert.ok(definedPathFooRef)
  t.assert.strictEqual(definedPathFoo, undefined)
})

test('invalid routeSelector', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  try {
    await fastify.register(require('..'), {
      documents: [{ documentRef: 'foo', routeSelector: 'foo', urlPrefix: '/foo' }],
    })
  } catch (err) {
    t.assert.ok(err)
    t.assert.strictEqual(
      err.message,
      '"routeSelector" option must be one of "ref", "prefix" or a function',
    )
  }
})

test('require urlPrefix when use routeSelector "prefix"', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  try {
    await fastify.register(require('..'), {
      documents: [{ documentRef: 'foo', routeSelector: 'prefix' }],
    })
  } catch (err) {
    t.assert.ok(err)
    t.assert.strictEqual(
      err.message,
      '"urlPrefix" option is required when "routeSelector" is "prefix"',
    )
  }
})

test('routeSelector with "prefix" and "urlPrefix" as an array', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  await fastify.register(require('..'), {
    documents: [{ documentRef: 'foo', routeSelector: 'prefix', urlPrefix: ['/foo', '/bar'] }],
  })

  fastify.get(
    '/foo',
    {
      schema: { querystring: { type: 'object', properties: { name: { type: 'string' } } } },
    },
    (req) => req.query,
  )

  fastify.get(
    '/bar',
    {
      schema: { querystring: { type: 'object', properties: { name: { type: 'string' } } } },
    },
    (req) => req.query,
  )

  await fastify.ready()

  const apiFoo = await Swagger.validate(fastify[getDecoratorName('foo')]())
  const definedPathFoo = apiFoo.paths['/foo']?.get
  const definedPathBar = apiFoo.paths['/bar']?.get

  t.assert.ok(definedPathFoo)
  t.assert.ok(definedPathBar)
})

test('routeSelector with "prefix" and "urlPrefix" as an empty array', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  try {
    await fastify.register(require('..'), {
      documents: [{ documentRef: 'foo', routeSelector: 'prefix', urlPrefix: [] }],
    })
  } catch (err) {
    t.assert.ok(err)
    t.assert.strictEqual(
      err.message,
      '"urlPrefix" option is required when "routeSelector" is "prefix"',
    )
  }
})

/**
 * @see https://github.com/inyourtime/fastify-route-preset
 */
test('should work with "fastify-route-preset" plugin', async (t) => {
  t.plan(2)
  const fastify = Fastify()
  t.after(() => fastify.close())

  fastify.register(require('fastify-route-preset'), {
    onPresetRoute: (routeOptions, preset) => {
      routeOptions.config = {
        ...preset,
        ...routeOptions.config,
      }
    },
  })

  await fastify.register(require('..'), {
    documents: [{ documentRef: 'foo' }, { documentRef: 'bar' }],
  })

  fastify.register(
    async (fastify) => {
      fastify.get(
        '/foo',
        {
          schema: { querystring: { type: 'object', properties: { name: { type: 'string' } } } },
        },
        () => {},
      )
    },
    {
      preset: {
        documentRef: 'foo',
      },
    },
  )

  fastify.register(
    async (fastify) => {
      fastify.get(
        '/bar',
        {
          schema: { querystring: { type: 'object', properties: { name: { type: 'string' } } } },
        },
        () => {},
      )
    },
    {
      preset: {
        documentRef: 'bar',
      },
    },
  )

  await fastify.ready()

  const apiFoo = await Swagger.validate(fastify[getDecoratorName('foo')]())
  const apiBar = await Swagger.validate(fastify[getDecoratorName('bar')]())

  const definedPathFoo = apiFoo.paths['/foo']?.get
  const definedPathBar = apiBar.paths['/bar']?.get

  t.assert.ok(definedPathFoo)
  t.assert.ok(definedPathBar)
})
