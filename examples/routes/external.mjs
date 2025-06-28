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
        documentRef: 'external',
      },
    },
    () => {},
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
        documentRef: 'external',
      },
    },
    () => {},
  )
}
