'use strict'

/**
 * @type {import('fastify').FastifyPluginCallback<>}
 */
module.exports = (fastify, opts, next) => {
  if (opts.exposeRoute.json) {
    fastify.route({
      method: 'GET',
      url: opts.jsonPath,
      schema: { hide: true },
      handler: (_req, reply) => {
        reply.send(fastify[opts.decorator]())
      },
    })
  }

  if (opts.exposeRoute.yaml) {
    fastify.route({
      method: 'GET',
      url: opts.yamlPath,
      schema: { hide: true },
      handler: (_req, reply) => {
        reply.type('application/x-yaml').send(fastify[opts.decorator]({ yaml: true }))
      },
    })
  }

  next()
}
