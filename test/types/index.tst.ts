import Fastify from "fastify";
import { expect } from "tstyche";
import fastifyMultipleSwagger from "../..";
import type {
  FastifyMultipleSwaggerOptions,
  SwaggerDocument,
  DocumentSource,
  ScalarDocumentSource,
} from "../..";

const app = Fastify();

app.register(fastifyMultipleSwagger, { documents: [] });
app.register(fastifyMultipleSwagger, { documents: ["foo", "bar"] });
app.register(fastifyMultipleSwagger, {
  documents: [{ decorator: "foo" }, { decorator: "bar" }],
});
app.register(fastifyMultipleSwagger, {
  documents: ["foo", { decorator: "bar" }],
});
app.register(fastifyMultipleSwagger, {
  documents: [
    {
      decorator: "foo",
      exposeRoute: false,
      swaggerOptions: {
        openapi: {
          info: {
            title: "foo",
            version: "1.0.0",
          },
        },
      },
    },
  ],
});
app.register(fastifyMultipleSwagger, {
  documents: [
    {
      decorator: "foo",
      exposeRoute: {
        json: true,
        yaml: false,
      },
      meta: {
        title: "Foo",
        slug: "foo",
      },
    },
  ],
});
app.register(fastifyMultipleSwagger, {
  documents: [
    {
      decorator: "foo",
      exposeRoute: {
        json: "/swagger.json",
        yaml: "/swagger.yaml",
      },
      routePrefix: "/doc",
    },
  ],
});
app.register(fastifyMultipleSwagger, {
  documents: ["foo", "bar"],
  defaultDecorator: "foo",
  routePrefix: "/docs",
});

const swaggerOption: SwaggerDocument = {
  decorator: "foo",
  exposeRoute: false,
  swaggerOptions: {
    openapi: {
      info: {
        title: "foo",
        version: "1.0.0",
      },
    },
  },
};

const pluginOptions: FastifyMultipleSwaggerOptions = {
  documents: [swaggerOption],
  defaultDecorator: "foo",
  routePrefix: "/docs",
};

app.register(fastifyMultipleSwagger, pluginOptions);

app
  .register(fastifyMultipleSwagger, {
    documents: ["foo"],
  })
  .ready(() => {
    app.getDocumentSources();
  });

app.post(
  "/",
  {
    config: {
      swaggerDecorator: "foo",
    },
  },
  () => {}
);

app.route({
  method: "GET",
  url: "/full",
  config: {
    swaggerDecorator: "foo",
  },
  handler: () => {},
});

expect<Array<DocumentSource>>().type.toBe(app.getDocumentSources());
expect<Array<ScalarDocumentSource>>().type.toBe(
  app.getDocumentSources({ scalar: true })
);
