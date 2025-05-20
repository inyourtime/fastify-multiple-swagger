/**
 * @type {import('fastify').FastifyPluginAsync<>}
 */
export default async function (app) {
  app.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            point: { type: 'number' },
            target: { type: 'string' },
          },
          required: ['point', 'target'],
        },
      },
      config: {
        swaggerDecorator: 'external',
      },
    },
    (req, reply) => {
      reply.send(req.body)
    },
  )

  app.put(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
          },
        },
      },
      config: {
        swaggerDecorator: 'external',
      },
    },
    (req, reply) => {
      reply.send(req.body)
    },
  )
}
