/**
 * @type {import('fastify').FastifyPluginAsync<>}
 */
export default async function (app) {
  app.get(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
          },
        },
      },
      config: {
        documentRef: 'internal',
      },
    },
    () => {},
  )

  app.post(
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
        documentRef: 'internal',
      },
    },
    () => {},
  )
}
