'use strict'

const fp = require('fastify-plugin')
const fastifySwagger = require('@fastify/swagger')

module.exports = fp((fastify, opts, done) => {
  if (typeof opts.decorator !== 'string') {
    done(new TypeError('"decorator" option must be a string'))
  }

  if (opts.defaultDecorator && typeof opts.defaultDecorator !== 'string') {
    done(new TypeError('"defaultDecorator" option must be a string'))
  }

  if (fastify.hasDecorator(opts.decorator)) {
    done(new Error(`Swagger decorator "${opts.decorator}" already exists`))
  }

  const options = opts.swaggerOptions || {}
  const { transform: transformFunc, ...swaggerOptions } = options

  fastify.register(fastifySwagger, {
    transform: (args) => {
      // First call transform option if provided
      const result = transformFunc ? transformFunc(args) : { schema: args.schema, url: args.url }

      const configDecorator = args.route.config?.swaggerDecorator || opts.defaultDecorator

      let hide = false
      if (configDecorator !== opts.decorator) {
        hide = true
      }

      return {
        schema: { ...result.schema, hide },
        url: result.url,
      }
    },
    ...swaggerOptions,
    decorator: opts.decorator,
  })

  done()
})
