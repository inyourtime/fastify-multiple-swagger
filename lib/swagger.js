'use strict'

const fp = require('fastify-plugin')

module.exports = fp((fastify, opts, next) => {
  if (fastify.hasDecorator(opts.swaggerDecorator)) {
    return next(new Error(`documentRef "${opts.documentRef}" already exists`))
  }

  if (opts.defaultDocumentRef && typeof opts.defaultDocumentRef !== 'string') {
    return next(new TypeError('"defaultDocumentRef" option must be a string'))
  }

  const routeSelector = opts.routeSelector
  const urlPrefix = opts.urlPrefix

  if (routeSelector && urlPrefix) {
    return next(
      new TypeError(
        '"routeSelector" and "urlPrefix" options cannot be used together. Please provide only one',
      ),
    )
  }

  if (routeSelector && typeof routeSelector !== 'function') {
    return next(new TypeError('"routeSelector" option must be a function'))
  }

  if (urlPrefix && typeof urlPrefix !== 'string' && !Array.isArray(urlPrefix)) {
    return next(new TypeError('"urlPrefix" option must be a string or an array of strings'))
  }

  const options = opts.swaggerOptions || {}
  const { transform: transformFunc, ...swaggerOptions } = options

  fastify.register(require('@fastify/swagger'), {
    transform: (args) => {
      // First call transform option if provided
      const result = transformFunc ? transformFunc(args) : { schema: args.schema, url: args.url }

      let hide

      if (routeSelector) {
        hide = !routeSelector(args.route, result.url)
      } else if (urlPrefix) {
        const prefixes = Array.isArray(urlPrefix) ? urlPrefix : [urlPrefix]
        const matchesPrefix = prefixes.some((prefix) => result.url.startsWith(prefix))

        if (!matchesPrefix) {
          hide = true
        }
      } else {
        const configRefs = [].concat(
          args.route.config?.documentRef || opts.defaultDocumentRef || [],
        )
        const targetRef = opts.documentRef
        hide = result.schema?.hide

        if (!configRefs.includes(targetRef) && hide !== true) {
          hide = true
        }
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
