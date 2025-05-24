'use strict'

const fp = require('fastify-plugin')

module.exports = fp((fastify, opts, next) => {
  if (fastify.hasDecorator(opts.swaggerDecorator)) {
    return next(new Error(`documentRef "${opts.documentRef}" already exists`))
  }

  if (opts.defaultDocumentRef && typeof opts.defaultDocumentRef !== 'string') {
    return next(new TypeError('"defaultDocumentRef" option must be a string'))
  }

  const options = opts.swaggerOptions || {}
  const { transform: transformFunc, ...swaggerOptions } = options

  fastify.register(require('@fastify/swagger'), {
    transform: (args) => {
      // First call transform option if provided
      const result = transformFunc ? transformFunc(args) : { schema: args.schema, url: args.url }

      const configDocumentRef = args.route.config?.documentRef || opts.defaultDocumentRef

      let hide = args.schema?.hide
      if (configDocumentRef !== opts.documentRef && hide !== true) {
        hide = true
      }

      return {
        schema: { ...result.schema, hide },
        url: result.url,
      }
    },
    ...swaggerOptions,
    decorator: opts.swaggerDecorator,
  })

  next()
})
