'use strict'

const fp = require('fastify-plugin')

const routeSelectors = ['ref', 'prefix']

module.exports = fp((fastify, opts, next) => {
  if (fastify.hasDecorator(opts.swaggerDecorator)) {
    return next(new Error(`documentRef "${opts.documentRef}" already exists`))
  }

  if (opts.defaultDocumentRef && typeof opts.defaultDocumentRef !== 'string') {
    return next(new TypeError('"defaultDocumentRef" option must be a string'))
  }

  const routeSelector = opts.routeSelector || 'ref'
  if (typeof routeSelector === 'string' && !routeSelectors.includes(routeSelector)) {
    return next(
      new TypeError(
        `"routeSelector" option must be one of ${routeSelectors.map((s) => `"${s}"`).join(', ')} or a function`,
      ),
    )
  }

  if (
    routeSelector === 'prefix' &&
    (!opts.urlPrefix || (Array.isArray(opts.urlPrefix) && !opts.urlPrefix.length))
  ) {
    return next(new TypeError('"urlPrefix" option is required when "routeSelector" is "prefix"'))
  }

  const options = opts.swaggerOptions || {}
  const { transform: transformFunc, ...swaggerOptions } = options

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
        const prefixes = Array.isArray(opts.urlPrefix) ? opts.urlPrefix : [opts.urlPrefix]
        const matchesPrefix = prefixes.some((prefix) => result.url.startsWith(prefix))
        if (!matchesPrefix) {
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
