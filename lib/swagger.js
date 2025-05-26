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
  const routeSelector = opts.routeSelector

  fastify.register(require('@fastify/swagger'), {
    transform: (args) => {
      // First call transform option if provided
      const result = transformFunc ? transformFunc(args) : { schema: args.schema, url: args.url }

      let hide

      if (routeSelector === 'ref') {
        const configDocumentRef = args.route.config?.documentRef || opts.defaultDocumentRef
        hide = result.schema?.hide
        if (configDocumentRef !== opts.documentRef && hide !== true) {
          hide = true
        }
      } else if (routeSelector === 'prefix') {
        if (!result.url.startsWith(opts.urlPrefix)) {
          hide = true
        }
      } else if (typeof routeSelector === 'function') {
        hide = !routeSelector(args.route, result.url)
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
