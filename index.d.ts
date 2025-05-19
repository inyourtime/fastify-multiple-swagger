import type { FastifyPluginAsync } from "fastify";
import type {
  FastifyStaticSwaggerOptions,
  FastifyDynamicSwaggerOptions,
} from "@fastify/swagger";

declare module "fastify" {
  interface FastifyInstance {
    getDocumentSources: (() => Array<fastifyMultipleSwagger.DocumentSource>) &
      ((opts: {
        scalar: true;
      }) => Array<fastifyMultipleSwagger.ScalarDocumentSource>);
  }

  interface FastifyContextConfig {
    swaggerDecorator?: string;
  }
}

type FastifyMultipleSwagger =
  FastifyPluginAsync<fastifyMultipleSwagger.FastifyMultipleSwaggerOptions>;

declare namespace fastifyMultipleSwagger {
  export interface FastifyMultipleSwaggerOptions {
    documents: Array<string | SwaggerDocument>;
    defaultDecorator?: string;
    routePrefix?: string;
  }

  export type SwaggerOptions =
    | FastifyStaticSwaggerOptions
    | Omit<FastifyDynamicSwaggerOptions, "decorator">;

  export interface SwaggerDocument {
    decorator: string;
    exposeRoute?: ExposeRouteOptions;
    swaggerOptions?: SwaggerOptions;
    routePrefix?: string;
    meta?: {
      title?: string;
      slug?: string;
    };
  }

  export type ExposeRouteOptions =
    | {
        json?: string | boolean;
        yaml?: string | boolean;
      }
    | boolean;

  export type DocumentSource = {
    decorator: string;
    json: string | null;
    yaml: string | null;
  };

  export type ScalarDocumentSource = {
    url: string;
    title?: string;
    slug?: string;
  };

  export const fastifyMultipleSwagger: FastifyMultipleSwagger;
  export { fastifyMultipleSwagger as default };
}

declare function fastifyMultipleSwagger(
  ...params: Parameters<FastifyMultipleSwagger>
): ReturnType<FastifyMultipleSwagger>;
export = fastifyMultipleSwagger;
