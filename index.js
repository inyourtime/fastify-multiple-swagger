'use strict'

const fp = require('fastify-plugin')
const { getExposeRouteOptions, getDecoratorName } = require('./lib/utils')

const routeSelectors = ['ref', 'prefix', 'none']

/**
 * @type {import('fastify').FastifyPluginCallback<import('.').FastifyMultipleSwaggerOptions>}
 */
function plugin(fastify, opts, next) {
  if (!Array.isArray(opts.documents)) {
    return next(new TypeError('"documents" option must be an array'))
  }

  const documentSources = []

  for (let index = 0; index < opts.documents.length; index++) {
    const documentOptions = opts.documents[index]

    const normalizedOptions =
      typeof documentOptions === 'string' ? { documentRef: documentOptions } : documentOptions

    if (typeof normalizedOptions !== 'object') {
      return next(new TypeError('"documents" option must be an array of objects or strings'))
    }

    if (typeof normalizedOptions.documentRef !== 'string') {
      return next(new TypeError('"documentRef" option must be a string'))
    }

    const routeSelector = normalizedOptions.routeSelector || 'ref'
    if (!routeSelectors.includes(routeSelector)) {
      return next(
        new TypeError(`"routeSelector" option must be one of ${routeSelectors.join(', ')}`),
      )
    }

    if (routeSelector === 'prefix' && !normalizedOptions.urlPrefix) {
      return next(new TypeError('"urlPrefix" option is required when "routeSelector" is "prefix"'))
    }

    const swaggerDecorator = getDecoratorName(normalizedOptions.documentRef)

    // Register swagger instance
    fastify.register(require('./lib/swagger'), {
      ...normalizedOptions,
      defaultDocumentRef: opts.defaultDocumentRef,
      swaggerDecorator,
      routeSelector,
      urlPrefix: normalizedOptions.urlPrefix,
    })

    const exposeRoute = getExposeRouteOptions(normalizedOptions.exposeRoute)
    const jsonPath = typeof exposeRoute.json === 'string' ? exposeRoute.json : `/doc-${index}/json`
    const yamlPath = typeof exposeRoute.yaml === 'string' ? exposeRoute.yaml : `/doc-${index}/yaml`

    const routePrefix = opts.routePrefix

    // Register route for json/yaml
    fastify.register(require('./lib/route'), {
      ...opts,
      prefix: routePrefix,
      exposeRoute,
      jsonPath,
      yamlPath,
      swaggerDecorator,
    })

    const documentSource = {
      documentRef: normalizedOptions.documentRef,
      json: exposeRoute.json ? (routePrefix ? withPrefix(routePrefix, jsonPath) : jsonPath) : null,
      yaml: exposeRoute.yaml ? (routePrefix ? withPrefix(routePrefix, yamlPath) : yamlPath) : null,
      name: normalizedOptions.name,
      meta: normalizedOptions.meta,
    }

    documentSources.push(documentSource)
  }

  fastify.decorate('getDocumentSources', (sourceOptions) => {
    if (typeof sourceOptions === 'object') {
      if (sourceOptions.scalar === true) {
        return documentSources.map((source) => ({
          url: source.json,
          title: source.name,
          ...source.meta,
        }))
      }

      if (sourceOptions.swaggerUI === true) {
        return documentSources.map((source) => ({
          url: source.json,
          name: source.name,
          ...source.meta,
        }))
      }
    }

    return documentSources
  })

  fastify.decorate('getDocument', (documentRef, options) => {
    if (typeof documentRef !== 'string') {
      throw new TypeError('"documentRef" must be a string')
    }
    const decorator = getDecoratorName(documentRef)

    if (fastify.hasDecorator(decorator) && typeof fastify[decorator] === 'function') {
      return fastify[decorator](options)
    }

    throw new Error(`documentRef "${documentRef}" does not exist`)
  })

  next()
}

/**
 * Add route prefix to the given url.
 * @param {string} routePrefix - the prefix
 * @param {string} url - the url
 * @returns {string} url with prefix
 */
function withPrefix(routePrefix, url) {
  const prefix = routePrefix.endsWith('/') ? routePrefix.slice(0, -1) : routePrefix
  return `${prefix}${url}`
}

/** exports */
const fastifyMultipleSwagger = fp(plugin, {
  fastify: '5.x',
  name: 'fastify-multiple-swagger',
})
module.exports = fastifyMultipleSwagger
module.exports.default = fastifyMultipleSwagger
module.exports.fastifyMultipleSwagger = fastifyMultipleSwagger
