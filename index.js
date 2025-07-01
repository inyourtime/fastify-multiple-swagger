'use strict'

const fp = require('fastify-plugin')
const { getExposeRouteOptions, getDecoratorName } = require('./lib/utils')

/**
 * @type {import('fastify').FastifyPluginCallback<import('.').FastifyMultipleSwaggerOptions>}
 */
function plugin(fastify, opts, next) {
  if (!Array.isArray(opts.documents)) {
    return next(new TypeError('"documents" option must be an array'))
  }

  const documentSources = []

  for (const [index, documentOptions] of opts.documents.entries()) {
    let normalizedOptions
    try {
      normalizedOptions = normalizeDocumentOptions(documentOptions)
    } catch (err) {
      return next(err)
    }

    const swaggerDecorator = getDecoratorName(normalizedOptions.documentRef)

    // Register swagger instance
    fastify.register(require('./lib/swagger'), {
      ...normalizedOptions,
      defaultDocumentRef: opts.defaultDocumentRef,
      swaggerDecorator,
    })

    const routeConfig = createRouteConfig(normalizedOptions, index)
    const routePrefix = opts.routePrefix

    // Register route for json/yaml
    fastify.register(require('./lib/route'), {
      ...opts,
      prefix: routePrefix,
      ...routeConfig,
      swaggerDecorator,
      hooks: normalizedOptions.hooks,
    })

    const documentSource = createDocumentSource(normalizedOptions, routeConfig, routePrefix)
    documentSources.push(documentSource)
  }

  fastify.decorate('getDocumentSources', getDocumentSources)
  fastify.decorate('getDocument', getDocument)

  function getDocumentSources(sourceOptions) {
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
  }

  function getDocument(documentRef, options) {
    if (typeof documentRef !== 'string') {
      throw new TypeError('"documentRef" must be a string')
    }
    const decorator = getDecoratorName(documentRef)

    if (fastify.hasDecorator(decorator) && typeof fastify[decorator] === 'function') {
      return fastify[decorator](options)
    }

    throw new Error(`documentRef "${documentRef}" does not exist`)
  }

  next()
}

/** @typedef {import('.').DocumentConfig} DocumentConfig */

/**
 * Normalize document options.
 *
 * If the document options is a string, it will be converted to an object with the `documentRef` property.
 * If the document options is an object, it must contain the `documentRef` property.
 *
 * @param {string | DocumentConfig} documentOptions - Document options
 * @returns {DocumentConfig} Normalized document options
 */
function normalizeDocumentOptions(documentOptions) {
  const normalizedOptions =
    typeof documentOptions === 'string' ? { documentRef: documentOptions } : documentOptions

  if (typeof normalizedOptions !== 'object') {
    throw new TypeError('"documents" option must be an array of objects or strings')
  }

  if (typeof normalizedOptions.documentRef !== 'string') {
    throw new TypeError('"documentRef" option must be a string')
  }

  return normalizedOptions
}

/**
 * @typedef {Object} RouteConfig
 * @property {import('./lib/utils').ExposeRouteOptions} exposeRoute - The expose route options
 * @property {string} jsonPath - The path to the JSON documentation
 * @property {string} yamlPath - The path to the YAML documentation
 */

/**
 * Create route configuration for a document.
 *
 * @param {DocumentConfig} opts - Normalized document options
 * @param {number} index - Document index
 * @returns {RouteConfig} Route configuration
 */
function createRouteConfig(opts, index) {
  const exposeRoute = getExposeRouteOptions(opts.exposeRoute)

  return {
    exposeRoute,
    jsonPath: typeof exposeRoute.json === 'string' ? exposeRoute.json : `/doc-${index}/json`,
    yamlPath: typeof exposeRoute.yaml === 'string' ? exposeRoute.yaml : `/doc-${index}/yaml`,
  }
}

/**
 * Create a document source object.
 *
 * The document source object contains the documentRef, json/yaml paths,
 * name, and meta data.
 *
 * @param {DocumentConfig} opts - Normalized document options
 * @param {RouteConfig} routeConfig - Route configuration
 * @param {string} routePrefix - The route prefix
 * @returns {import(".").DocumentSource} Document source object
 */
function createDocumentSource(opts, routeConfig, routePrefix) {
  const { exposeRoute, jsonPath, yamlPath } = routeConfig

  return {
    documentRef: opts.documentRef,
    json: exposeRoute.json ? withPrefix(routePrefix, jsonPath) : null,
    yaml: exposeRoute.yaml ? withPrefix(routePrefix, yamlPath) : null,
    name: opts.name,
    meta: opts.meta,
  }
}

/**
 * Add route prefix to the given url.
 * @param {string} routePrefix - the prefix
 * @param {string} url - the url
 * @returns {string} url with prefix
 */
function withPrefix(routePrefix, url) {
  if (!routePrefix) {
    return url
  }

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
