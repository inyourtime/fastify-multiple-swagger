'use strict'

/**
 * @type {import('fastify').FastifyPluginCallback<>}
 */
module.exports = (fastify, opts, next) => {
  const hooks = Object.create(null)
  if (opts.hooks) {
    const additionalHooks = ['onRequest', 'preHandler']
    for (const hook of additionalHooks) {
      hooks[hook] = opts.hooks[hook]
    }
  }

  if (opts.exposeRoute.json) {
    fastify.route({
      method: 'GET',
      url: opts.jsonPath,
      schema: { hide: true },
      ...hooks,
      handler: (_req, reply) => {
        reply.send(fastify[opts.swaggerDecorator]())
      },
    })
  }

  if (opts.exposeRoute.yaml) {
    fastify.route({
      method: 'GET',
      url: opts.yamlPath,
      schema: { hide: true },
      ...hooks,
      handler: (_req, reply) => {
        reply.type('application/x-yaml').send(fastify[opts.swaggerDecorator]({ yaml: true }))
      },
    })
  }

  next()
}
