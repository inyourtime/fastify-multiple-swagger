'use strict'

const fp = require('fastify-plugin')

/**
 * @type {import('fastify').FastifyPluginAsync<>}
 */
async function plugin(fastify, opts) {
	if (!Array.isArray(opts.documents)) {
		throw new TypeError('"documents" option must be an array')
	}

	for (const documentOptions of opts.documents) {
		await fastify.register(require('./lib/swagger'), {
			...documentOptions,
			defaultDecorator: opts.defaultDecorator,
		})
	}
}

/** exports */
const fastifyMultipleSwagger = fp(plugin, {
	fastify: '5.x',
	name: 'fastify-multiple-swagger',
})
module.exports = fastifyMultipleSwagger
module.exports.default = fastifyMultipleSwagger
module.exports.fastifyMultipleSwagger = fastifyMultipleSwagger
