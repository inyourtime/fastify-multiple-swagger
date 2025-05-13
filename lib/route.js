'use strict'

/**
 * @type {import('fastify').FastifyPluginCallback<>}
 */
module.exports = (fastify, opts, done) => {
  let jsonRoute = true
  let yamlRoute = true

  // look at this again
  if (typeof opts.addRoute === 'object') {
    if (opts.addRoute.json !== undefined) {
      jsonRoute = opts.addRoute.json
    }
    if (opts.addRoute.yaml !== undefined) {
      yamlRoute = opts.addRoute.yaml
    }
  }

  let docIndex = 0

  for (const document of opts.documents) {
    docIndex++

    const urlJson = `/doc-${docIndex}/json`
    const urlYaml = `/doc-${docIndex}/yaml`

    if (jsonRoute === true) {
      fastify.route({
        method: 'GET',
        url: urlJson,
        schema: { hide: true },
        handler: (_req, reply) => {
          reply.send(fastify[document.decorator]())
        },
      })
    }

    if (yamlRoute === true) {
      fastify.route({
        method: 'GET',
        url: urlYaml,
        schema: { hide: true },
        handler: (_req, reply) => {
          reply.type('application/x-yaml').send(fastify[document.decorator]({ yaml: true }))
        },
      })
    }
  }

  done()
}
