import type { FastifyDynamicSwaggerOptions, FastifyStaticSwaggerOptions } from '@fastify/swagger'
import type { FastifyPluginAsync } from 'fastify'

declare module 'fastify' {
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
      ((opts: { scalar: true }) => Array<fastifyMultipleSwagger.ScalarSource>) &
      ((opts: {
        swaggerUI: true
      }) => Array<fastifyMultipleSwagger.SwaggerUISource>)
  }

  interface FastifyContextConfig {
    /**
     * Swagger document reference used for this route
     */
    documentRef?: string
  }
}

type FastifyMultipleSwagger =
  FastifyPluginAsync<fastifyMultipleSwagger.FastifyMultipleSwaggerOptions>

declare namespace fastifyMultipleSwagger {
  export interface FastifyMultipleSwaggerOptions {
    /**
     * Array of document configurations or documentRef names (required)
     */
    documents: Array<string | DocumentConfig>
    /**
     * Default documentRef name for routes without explicit documentRef
     * @default undefined
     */
    defaultDocumentRef?: string
    /**
     * Global prefix for all document routes (json and yaml)
     */
    routePrefix?: string
  }

  export type SwaggerOptions =
    | FastifyStaticSwaggerOptions
    | Omit<FastifyDynamicSwaggerOptions, 'decorator'>

  export interface DocumentConfig {
    /**
     * Unique reference name for the Swagger document
     */
    documentRef: string
    /**
     * Configuration for exposing JSON/YAML routes
     * Can be boolean or object with `json` and `yaml` as booleans or strings
     * If `json` and `yaml` are strings, they will be used as route paths
     *
     * @default true
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
    exposeRoute?: ExposeRouteOptions
    /**
     * Configuration passed to @fastify/swagger
     * @see https://github.com/fastify/fastify-swagger?tab=readme-ov-file#api
     */
    swaggerOptions?: SwaggerOptions
    /**
     * Display name for the UI providers
     */
    name?: string
    /**
     * Additional metadata for UI providers configuration
     */
    meta?: {
      [key: string]: any
    }
  }

  export type ExposeRouteOptions =
    | {
        json?: string | boolean
        yaml?: string | boolean
      }
    | boolean

  export type DocumentSource = {
    /**
     * Unique reference name for the Swagger document
     */
    documentRef: string
    /**
     * Url for JSON route
     * @default `/doc-${index}/json`
     */
    json: string | null
    /**
     * Url for YAML route
     * @default `/doc-${index}/yaml`
     */
    yaml: string | null
  }

  export type ScalarSource = {
    url: string
    title: string
    [key: string]: any
  }

  export type SwaggerUISource = {
    url: string
    name: string
  }

  export const fastifyMultipleSwagger: FastifyMultipleSwagger
  export { fastifyMultipleSwagger as default }
}

declare function fastifyMultipleSwagger(
  ...params: Parameters<FastifyMultipleSwagger>
): ReturnType<FastifyMultipleSwagger>
export = fastifyMultipleSwagger
