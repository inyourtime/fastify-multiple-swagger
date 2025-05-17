'use strict'

/**
 * @type {import('fastify').FastifyPluginCallback<>}
 */
module.exports = (fastify, opts, done) => {
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

  done()
}

function getPublishOptions(publish) {
  if (typeof publish === 'object') {
    return publish
  }

  if (publish === false) {
    return {
      json: false,
      yaml: false,
    }
  }

  return {
    json: true,
    yaml: true,
  }
}
