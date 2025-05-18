'use strict'

const fp = require('fastify-plugin')

/**
 * @type {import('fastify').FastifyPluginCallback<>}
 */
function plugin(fastify, opts, next) {
  if (!Array.isArray(opts.documents)) {
    return next(new TypeError('"documents" option must be an array'))
  }

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

    // Register route for json/yaml
    fastify.register(require('./lib/route'), {
      ...opts,
      prefix: opts.routePrefix,
      ...normalizedOptions,
      documentIndex: index,
    })
  }

  next()
}

/** exports */
const fastifyMultipleSwagger = fp(plugin, {
  fastify: '5.x',
  name: 'fastify-multiple-swagger',
})
module.exports = fastifyMultipleSwagger
module.exports.default = fastifyMultipleSwagger
module.exports.fastifyMultipleSwagger = fastifyMultipleSwagger
