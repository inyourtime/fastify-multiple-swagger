import type { FastifyPluginAsync } from "fastify";
import type {
  FastifyStaticSwaggerOptions,
  FastifyDynamicSwaggerOptions,
} from "@fastify/swagger";

declare module "fastify" {
  interface FastifyInstance {
    getDocumentSources: () => Array<{
      decorator: string;
      json: string | null;
      yaml: string | null;
    }>;
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
    publish?: PublishOptions;
    swaggerOptions?: SwaggerOptions;
  }

  export type PublishOptions =
    | {
        json?: string | boolean;
        yaml?: string | boolean;
      }
    | boolean;

  export const fastifyMultipleSwagger: FastifyMultipleSwagger;
  export { fastifyMultipleSwagger as default };
}

declare function fastifyMultipleSwagger(
  ...params: Parameters<FastifyMultipleSwagger>
): ReturnType<FastifyMultipleSwagger>;
export = fastifyMultipleSwagger;
