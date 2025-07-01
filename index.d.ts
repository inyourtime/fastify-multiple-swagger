import type { FastifyDynamicSwaggerOptions, FastifyStaticSwaggerOptions } from '@fastify/swagger'
import type {
  FastifyPluginAsync,
  RouteOptions,
  onRequestHookHandler,
  preHandlerHookHandler,
} from 'fastify'
import type { OpenAPI } from 'openapi-types'

declare module 'fastify' {
  interface FastifyInstance {
    /**
     * Returns an array of document sources
     *
     * @example
     * ```js
     * fastify.getDocumentSources()
     * fastify.getDocumentSources({ scalar: true })
     * fastify.getDocumentSources({ swaggerUI: true })
     * ```
     */
    getDocumentSources: (() => Array<fastifyMultipleSwagger.DocumentSource>) &
      ((opts: { scalar: true }) => Array<fastifyMultipleSwagger.ScalarSource>) &
      ((opts: { swaggerUI: true }) => Array<fastifyMultipleSwagger.SwaggerUISource>)

    /**
     * Returns a swagger document by documentRef
     * If documentRef does not exist, then an error is thrown
     *
     * @example
     * ```js
     * fastify.getDocument('foo')
     * fastify.getDocument('foo', { yaml: false })
     * fastify.getDocument('foo', { yaml: true })
     * ```
     */
    getDocument: ((documentRef: string, opts?: { yaml?: false }) => OpenAPI.Document) &
      ((documentRef: string, opts: { yaml: true }) => string) &
      ((documentRef: string, opts: { yaml: boolean }) => OpenAPI.Document | string)
  }

  interface FastifyContextConfig {
    /**
     * Swagger document reference used for this route
     */
    documentRef?: string | string[]
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
    routePrefix?: `/${string}`
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
     * URL path prefix used to match routes to this Swagger document
     *
     * If a route starts with this prefix, it will be associated with this document.
     *
     * Example:
     * ```js
     * urlPrefix: '/admin'
     * // Routes like /admin/users or /admin/settings will be matched to this document
     * urlPrefix: ['/admin', '/customer']
     * // Routes like /admin/settings or /customer/profile will be matched to this document
     * ```
     */
    urlPrefix?: `/${string}` | Array<`/${string}`>
    /**
     * Determines how routes are matched to this Swagger document.
     *
     * @example
     * ```js
     * routeSelector: (routeOptions, url) => {
     *   return routeOptions.config?.documentRef === 'foo' && url.startsWith('/foo')
     * }
     * ```
     */
    routeSelector?: (routeOptions: RouteOptions, url: string) => boolean
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
     * ```
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
    /**
     * The hooks to use for this document
     * 
     * @example
     * ```js
     * hooks: {
     *   onRequest: (req, _reply, done) => {
     *    console.log(req.url)
     *    done()
     *   },
     * }
     * ```
     }
     */
    hooks?: HooksOptions
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

  export type HooksOptions = Partial<{
    onRequest?: onRequestHookHandler
    preHandler?: preHandlerHookHandler
  }>

  export const fastifyMultipleSwagger: FastifyMultipleSwagger
  export { fastifyMultipleSwagger as default }
}

declare function fastifyMultipleSwagger(
  ...params: Parameters<FastifyMultipleSwagger>
): ReturnType<FastifyMultipleSwagger>
export = fastifyMultipleSwagger
