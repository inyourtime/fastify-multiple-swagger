'use strict'

const { getPublishOptions } = require('./utils')

/**
 * @type {import('fastify').FastifyPluginCallback<>}
 */
module.exports = (fastify, opts, next) => {
  const publish = getPublishOptions(opts.publish)

  const urlJson = `/doc-${opts.documentIndex}/json`
  const urlYaml = `/doc-${opts.documentIndex}/yaml`

  if (publish.json) {
    fastify.route({
      method: 'GET',
      url: typeof publish.json === 'string' ? publish.json : urlJson,
      schema: { hide: true },
      handler: (_req, reply) => {
        reply.send(fastify[opts.decorator]())
      },
    })
  }

  if (publish.yaml) {
    fastify.route({
      method: 'GET',
      url: typeof publish.yaml === 'string' ? publish.yaml : urlYaml,
      schema: { hide: true },
      handler: (_req, reply) => {
        reply.type('application/x-yaml').send(fastify[opts.decorator]({ yaml: true }))
      },
    })
  }

  next()
}
