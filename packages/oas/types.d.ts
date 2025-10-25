import { OpenApiSpecification } from 'swagger-route-validator';
import { Express, Request, RequestHandler } from 'express';

/**
 * OpenAPI parameter definition
 */
export interface OASParameter {
  /** Parameter name */
  name: string
  /** Parameter location (path, query, header, cookie, body) */
  in: 'path' | 'query' | 'header' | 'cookie' | 'body'
  /** Parameter description */
  description?: string
  /** Whether the parameter is required */
  required?: boolean
  /** Parameter type (OpenAPI 2.0 style) */
  type?: string
  /** Parameter schema (OpenAPI 3.0 style) */
  schema?: Record<string, unknown>
  /** Parameter format */
  format?: string
  /** Default value */
  default?: unknown
  /** Example value */
  example?: unknown
}

/**
 * OpenAPI response definition
 */
export interface OASResponse {
  /** Response description */
  description?: string
  /** Response schema */
  schema?: Record<string, unknown>
  /** Response headers */
  headers?: Record<string, unknown>
  /** Response examples */
  examples?: Record<string, unknown>
  /** Response content (OpenAPI 3.0 style) */
  content?: Record<string, unknown>
}

/**
 * OpenAPI operation definition (method-level)
 */
export interface OASOperation {
  /** Operation summary */
  summary?: string
  /** Operation description */
  description?: string
  /** Operation ID */
  operationId?: string
  /** Tags for this operation */
  tags?: string[]
  /** Parameters for this operation */
  parameters?: OASParameter[]
  /** Request body definition */
  requestBody?: {
    description?: string
    required?: boolean
    content?: Record<string, unknown>
  }
  /** Responses for this operation */
  responses?: {
    [statusCode: string]: OASResponse
  }
  /** Whether this operation is deprecated */
  deprecated?: boolean
  /** Security requirements for this operation */
  security?: Array<Record<string, string[]>>
  /** External documentation */
  externalDocs?: {
    description?: string
    url: string
  }
}

/**
 * Route definition that can contain multiple HTTP methods
 */
export interface OASRouteDefinition {
  get?: OASOperation
  post?: OASOperation
  put?: OASOperation
  patch?: OASOperation
  delete?: OASOperation
  options?: OASOperation
  head?: OASOperation
}

/**
 * Definition override can be either:
 * - A single operation (for use with specific method routes like app.get())
 * - A route definition with multiple methods (for use with app.route())
 */
export type RouteDefinitionOverride = OASOperation | OASRouteDefinition;

/**
 * OpenAPI specification with components
 */
export interface OASSpec extends Partial<OpenApiSpecification> {
  /** Base path for all routes (e.g., '/api') */
  basePath?: string
  /** OpenAPI components (schemas, responses, parameters, etc.) */
  components?: {
    schemas?: Record<string, unknown>
    responses?: Record<string, unknown>
    parameters?: Record<string, unknown>
    examples?: Record<string, unknown>
    requestBodies?: Record<string, unknown>
    headers?: Record<string, unknown>
    securitySchemes?: Record<string, unknown>
    links?: Record<string, unknown>
    callbacks?: Record<string, unknown>
    [key: string]: unknown
  }
  /** OpenAPI version */
  openapi?: string
  /** API information */
  info?: {
    title?: string
    version?: string
    description?: string
    termsOfService?: string
    contact?: {
      name?: string
      url?: string
      email?: string
    }
    license?: {
      name?: string
      url?: string
    }
  }
  /** Server definitions */
  servers?: Array<{
    url: string
    description?: string
    variables?: Record<string, unknown>
  }>
  /** API paths */
  paths?: Record<string, OASRouteDefinition>
  /** Tags */
  tags?: Array<{
    name: string
    description?: string
    externalDocs?: {
      description?: string
      url: string
    }
  }>
  /** External documentation */
  externalDocs?: {
    description?: string
    url: string
  }
}

/**
 * Express router enhanced with OAS functionality
 */
export interface OASRouter extends Express {
  /**
   * Manually trigger route scanning to build the OpenAPI specification.
   * This is automatically called when listen() is invoked.
   * Use this when working with subrouters that won't call listen() directly.
   */
  scan: () => void

  /**
   * Internal OpenAPI specification (populated after scan)
   * @internal
   */
  _oas?: OASSpec
}

/**
 * Express Request extended with OAS context
 */
export interface OASRequest extends Request {
  /**
   * The OpenAPI specification for this request context
   * @internal
   */
  _oas?: OASSpec
}

declare module '@express-tools/oas' {
  /**
   * Define or override OpenAPI metadata for a route.
   *
   * @param override - The OpenAPI operation or route definition
   * @returns Express middleware that stores the definition for scanning
   *
   * @example
   * ```typescript
   * server.get('/user/:id', definition({
   *   description: 'Get a user by ID',
   *   parameters: [{
   *     name: 'id',
   *     in: 'path',
   *     type: 'string',
   *     required: true
   *   }],
   *   responses: {
   *     200: { schema: { $ref: '#/components/schemas/User' } }
   *   }
   * }), (req, res) => {
   *   // handler
   * });
   * ```
   */
  export function definition(override: RouteDefinitionOverride): RequestHandler;

  /**
   * Generate and return the complete OpenAPI specification as JSON.
   * Includes all route definitions and overrides.
   *
   * @returns Express middleware that responds with the OpenAPI spec
   *
   * @example
   * ```typescript
   * server.get('/docs', documentation());
   * ```
   */
  export function documentation(): RequestHandler;

  /**
   * Validate the response body against the OpenAPI specification.
   * Throws an error if the response doesn't match the defined schema.
   *
   * @returns Express middleware that validates responses
   *
   * @example
   * ```typescript
   * server.get('/user/:id',
   *   definition({ responses: { 200: { schema: { $ref: '#/components/schemas/User' } } } }),
   *   response(),
   *   (req, res) => {
   *     res.json({ id: '123', name: 'John' });
   *   }
   * );
   * ```
   */
  export function response(): RequestHandler;

  /**
   * Wrap an Express app or router with OpenAPI functionality.
   * Automatically scans routes when listen() is called.
   *
   * @param app - Express application or router to enhance
   * @param spec - OpenAPI specification (optional)
   * @returns Enhanced Express router with OAS capabilities
   *
   * @example
   * ```typescript
   * const server = router(express(), {
   *   info: {
   *     title: 'My API',
   *     version: '1.0.0'
   *   },
   *   components: {
   *     schemas: {
   *       User: {
   *         type: 'object',
   *         properties: {
   *           id: { type: 'string' },
   *           name: { type: 'string' }
   *         }
   *       }
   *     }
   *   }
   * });
   * ```
   */
  export function router(app: Express, spec?: OASSpec): OASRouter;

  /**
   * Validate incoming requests against the OpenAPI specification.
   * Validates path parameters, query parameters, headers, and request body.
   *
   * @returns Express middleware that validates requests
   *
   * @example
   * ```typescript
   * server.post('/user',
   *   definition({
   *     parameters: [{
   *       name: 'body',
   *       in: 'body',
   *       schema: { $ref: '#/components/schemas/User' }
   *     }]
   *   }),
   *   validation(),
   *   (req, res) => {
   *     // req.body is validated
   *   }
   * );
   * ```
   */
  export function validation(): RequestHandler;

  // Export types for external use
  export type {
    OASParameter,
    OASResponse,
    OASOperation,
    OASRouteDefinition,
    RouteDefinitionOverride,
    OASSpec,
    OASRouter,
    OASRequest,
  };
}
