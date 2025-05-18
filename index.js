'use strict'

const fp = require('fastify-plugin')
const { getPublishOptions } = require('./lib/utils')

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
      typeof documentOptions === 'string' ? { decorator: documentOptions } : documentOptions

    if (typeof normalizedOptions !== 'object') {
      return next(new TypeError('"documents" option must be an array of objects or strings'))
    }

    // Register swagger instance
    fastify.register(require('./lib/swagger'), {
      ...normalizedOptions,
      defaultDecorator: opts.defaultDecorator,
    })

    const publish = getPublishOptions(normalizedOptions.publish)
    const jsonPath = typeof publish.json === 'string' ? publish.json : `/doc-${index}/json`
    const yamlPath = typeof publish.yaml === 'string' ? publish.yaml : `/doc-${index}/yaml`

    // Register route for json/yaml
    fastify.register(require('./lib/route'), {
      ...opts,
      prefix: opts.routePrefix,
      publish,
      jsonPath,
      yamlPath,
      decorator: normalizedOptions.decorator,
    })

    const documentSource = {
      decorator: normalizedOptions.decorator,
      json: publish.json
        ? opts.routePrefix
          ? withPrefix(opts.routePrefix, jsonPath)
          : jsonPath
        : null,
      yaml: publish.yaml
        ? opts.routePrefix
          ? withPrefix(opts.routePrefix, yamlPath)
          : yamlPath
        : null,
    }

    documentSources.push(documentSource)
  }

  fastify.decorate('getDocumentSources', () => documentSources)

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
