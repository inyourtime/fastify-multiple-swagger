import type { FastifyPluginAsync } from "fastify";
import type {
  FastifyStaticSwaggerOptions,
  FastifyDynamicSwaggerOptions,
} from "@fastify/swagger";

declare module "fastify" {
  interface FastifyInstance {
    /**
     * Returns an array of document sources
     *
     * @example
     * ```js
     * app.getDocumentSources()
     * app.getDocumentSources({ scalar: true })
     * app.getDocumentSources({ swaggerUI: true })
     * ```
     */
    getDocumentSources: (() => Array<fastifyMultipleSwagger.DocumentSource>) &
      ((opts: {
        scalar: true;
      }) => Array<fastifyMultipleSwagger.ScalarDocumentSource>) &
      ((opts: {
        swaggerUI: true;
      }) => Array<fastifyMultipleSwagger.SwaggerUIDocumentSource>);
  }

  interface FastifyContextConfig {
    /**
     * Decorator name (Unique identifier for the document)
     */
    swaggerDecorator?: string;
  }
}

type FastifyMultipleSwagger =
  FastifyPluginAsync<fastifyMultipleSwagger.FastifyMultipleSwaggerOptions>;

declare namespace fastifyMultipleSwagger {
  export interface FastifyMultipleSwaggerOptions {
    /**
     * Array of document configurations or decorator names (required)
     */
    documents: Array<string | SwaggerDocument>;
    /**
     * Default decorator name for routes without explicit decorator
     */
    defaultDecorator?: string;
    /**
     * Global prefix for all document routes
     */
    routePrefix?: string;
  }

  export type SwaggerOptions =
    | FastifyStaticSwaggerOptions
    | Omit<FastifyDynamicSwaggerOptions, "decorator">;

  export interface SwaggerDocument {
    /**
     * Decorator name (Unique identifier for the document)
     */
    decorator: string;
    /**
     * Configuration for exposing JSON/YAML routes
     * Can be boolean or object with `json` and `yaml` as booleans or strings
     * If `json` and `yaml` are strings, they will be used as route paths
     *
     * @example
     * ```js
     * exposeRoute: {
     *   json: '/swagger.json',
     *   yaml: '/swagger.yaml',
     * }
     *
     * exposeRoute: {
     *   json: '/swagger.json',
     *   yaml: false,
     * }
     *
     */
    exposeRoute?: ExposeRouteOptions;
    /**
     * Configuration passed to @fastify/swagger
     * @see https://github.com/fastify/fastify-swagger?tab=readme-ov-file#api
     */
    swaggerOptions?: SwaggerOptions;
    /**
     * Document-specific route prefix
     */
    routePrefix?: string;
    /**
     * Display name for the document
     */
    name?: string;
    /**
     * Additional metadata for UI providers configuration
     */
    meta?: {
      [key: string]: any;
    };
  }

  export type ExposeRouteOptions =
    | {
        json?: string | boolean;
        yaml?: string | boolean;
      }
    | boolean;

  export type DocumentSource = {
    /**
     * Decorator name
     */
    decorator: string;
    /**
     * Url for JSON route
     */
    json: string | null;
    /**
     * Url for YAML route
     */
    yaml: string | null;
  };

  export type ScalarDocumentSource = {
    url: string;
    title: string;
    [key: string]: any;
  };

  export type SwaggerUIDocumentSource = {
    url: string;
    name: string;
  };

  export const fastifyMultipleSwagger: FastifyMultipleSwagger;
  export { fastifyMultipleSwagger as default };
}

declare function fastifyMultipleSwagger(
  ...params: Parameters<FastifyMultipleSwagger>
): ReturnType<FastifyMultipleSwagger>;
export = fastifyMultipleSwagger;
