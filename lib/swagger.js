'use strict'

const fp = require('fastify-plugin')

module.exports = fp((fastify, opts, next) => {
  if (typeof opts.decorator !== 'string') {
    return next(new TypeError('"decorator" option must be a string'))
  }

  if (fastify.hasDecorator(opts.decorator)) {
    return next(new Error(`Swagger decorator "${opts.decorator}" already exists`))
  }

  if (opts.defaultDecorator && typeof opts.defaultDecorator !== 'string') {
    return next(new TypeError('"defaultDecorator" option must be a string'))
  }

  const options = opts.swaggerOptions || {}
  const { transform: transformFunc, ...swaggerOptions } = options

  fastify.register(require('@fastify/swagger'), {
    transform: (args) => {
      // First call transform option if provided
      const result = transformFunc ? transformFunc(args) : { schema: args.schema, url: args.url }

      const configDecorator = args.route.config?.swaggerDecorator || opts.defaultDecorator

      let hide = args.schema?.hide
      if (configDecorator !== opts.decorator && hide !== true) {
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

  next()
})
