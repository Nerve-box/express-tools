import { Express, Request, RequestHandler } from 'express';
import { JSONRPCServer } from 'json-rpc-2.0';

/**
 * JSON Schema definition for MCP tool schemas
 */
export interface JSONSchema {
  type?: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  properties?: Record<string, JSONSchema>
  items?: JSONSchema
  required?: string[]
  description?: string
  enum?: unknown[]
  default?: unknown
  format?: string
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  additionalProperties?: boolean | JSONSchema
  [key: string]: unknown
}

/**
 * MCP tool handler function signature
 * Receives arguments and the original Express request context
 */
export type MCPToolHandler<TArgs = Record<string, unknown>, TResult = unknown> = (
  args: TArgs,
  req: Request,
) => TResult | Promise<TResult>;

/**
 * MCP tool definition following the Model Context Protocol specification
 */
export interface MCPToolDefinition {
  /** Unique name for this tool */
  name: string
  /** Human-readable description of what this tool does */
  description?: string
  /** JSON Schema defining the input arguments */
  inputSchema: JSONSchema
  /** JSON Schema defining the output structure */
  outputSchema?: JSONSchema
  /**
   * Optional custom handler function.
   * If provided, this will be called instead of the route handler when invoked via MCP.
   */
  handler?: MCPToolHandler
}

/**
 * MCP server information
 */
export interface MCPServerInfo {
  /** Server name */
  name: string
  /** Server version */
  version: string
  /** Additional server metadata */
  [key: string]: unknown
}

/**
 * MCP router configuration spec
 */
export interface MCPSpec {
  /** Server identification information (required) */
  serverInfo: MCPServerInfo
  /** Base path for the MCP JSON-RPC endpoint (default: '/mcp') */
  basePath?: string
  /** Predefined tools to register */
  tools?: MCPToolDefinition[]
  /** Predefined handlers for tools */
  handlers?: Record<string, MCPToolHandler>
}

/**
 * Internal MCP context stored on the Express app
 */
export interface MCPContext {
  /** Registered tools keyed by name */
  tools: Record<string, MCPToolDefinition>
  /** Tool handlers keyed by tool name */
  handlers: Record<string, MCPToolHandler>
  /** JSON-RPC 2.0 server instance */
  server: JSONRPCServer
}

/**
 * Express router enhanced with MCP functionality
 */
export interface MCPRouter extends Express {
  /**
   * Internal MCP context (populated during initialization)
   * @internal
   */
  _mcp: MCPContext
}

/**
 * Express Request extended with MCP context
 */
export interface MCPRequest extends Request {
  /**
   * The MCP context for this request
   * @internal
   */
  _mcp?: MCPContext
}

/**
 * MCP protocol version
 */
export type MCPProtocolVersion = '2024-11-05';

/**
 * MCP initialize response
 */
export interface MCPInitializeResponse {
  protocolVersion: MCPProtocolVersion
  capabilities: {
    tools: {
      listChanged: boolean
    }
  }
  serverInfo: MCPServerInfo
}

/**
 * MCP tools/list response
 */
export interface MCPToolsListResponse {
  tools: MCPToolDefinition[]
}

/**
 * MCP content types
 */
export type MCPContentType = 'text' | 'image' | 'resource';

/**
 * MCP content item
 */
export interface MCPContent {
  type: MCPContentType
  [key: string]: unknown
}

/**
 * MCP tools/call response
 */
export interface MCPToolCallResponse {
  content: MCPContent[]
}

declare module '@express-tools/mcp' {
  /**
   * Define an MCP tool for a route.
   * The route can be invoked via standard HTTP or through the MCP JSON-RPC endpoint.
   *
   * @param toolDefinition - The MCP tool definition including name, schemas, and optional handler
   * @returns Express middleware that registers the tool for MCP access
   *
   * @example
   * ```typescript
   * server.post('/calculate', definition({
   *   name: 'calculate',
   *   description: 'Performs arithmetic operations',
   *   inputSchema: {
   *     type: 'object',
   *     properties: {
   *       operation: { type: 'string', enum: ['add', 'subtract'] },
   *       a: { type: 'number' },
   *       b: { type: 'number' }
   *     },
   *     required: ['operation', 'a', 'b']
   *   },
   *   outputSchema: {
   *     type: 'object',
   *     properties: {
   *       type: { type: 'string' },
   *       result: { type: 'number' }
   *     }
   *   }
   * }), (req, res) => {
   *   const { operation, a, b } = req.body;
   *   const result = operation === 'add' ? a + b : a - b;
   *   res.json(result);
   * });
   * ```
   *
   * @example With custom handler
   * ```typescript
   * server.post('/search', definition({
   *   name: 'search',
   *   description: 'Search documents',
   *   inputSchema: {
   *     type: 'object',
   *     properties: {
   *       query: { type: 'string' }
   *     }
   *   },
   *   outputSchema: {
   *     type: 'object',
   *     properties: {
   *       type: { type: 'string' },
   *       results: { type: 'array' }
   *     }
   *   },
   *   handler: async (args, req) => {
   *     // Custom logic for MCP invocations
   *     return await searchDocuments(args.query);
   *   }
   * }), (req, res) => {
   *   // Standard HTTP handler
   *   res.json({ message: 'Use MCP for access' });
   * });
   * ```
   */
  export function definition(toolDefinition: MCPToolDefinition): RequestHandler;

  /**
   * Wrap an Express app with Model Context Protocol functionality.
   * Sets up JSON-RPC 2.0 endpoint and implements MCP protocol methods:
   * - initialize: Returns server info and capabilities
   * - tools/list: Lists all registered tools
   * - tools/call: Executes a tool by name
   *
   * @param app - Express application to enhance
   * @param spec - MCP configuration (serverInfo is required)
   * @returns Enhanced Express app with MCP capabilities
   *
   * @example Basic setup
   * ```typescript
   * const server = router(express(), {
   *   serverInfo: {
   *     name: 'my-api',
   *     version: '1.0.0'
   *   },
   *   basePath: '/mcp' // Optional, defaults to '/mcp'
   * });
   * ```
   *
   * @example With predefined tools
   * ```typescript
   * const server = router(express(), {
   *   serverInfo: {
   *     name: 'my-api',
   *     version: '1.0.0'
   *   },
   *   tools: [
   *     {
   *       name: 'get_weather',
   *       description: 'Get weather for a location',
   *       inputSchema: {
   *         type: 'object',
   *         properties: {
   *           location: { type: 'string' }
   *         },
   *         required: ['location']
   *       }
   *     }
   *   ],
   *   handlers: {
   *     get_weather: async (args) => {
   *       return { temperature: 72, conditions: 'Sunny' };
   *     }
   *   }
   * });
   * ```
   */
  export function router(app: Express, spec: MCPSpec): MCPRouter;

  // Export types for external use
  export type {
    JSONSchema,
    MCPToolHandler,
    MCPToolDefinition,
    MCPServerInfo,
    MCPSpec,
    MCPContext,
    MCPRouter,
    MCPRequest,
    MCPProtocolVersion,
    MCPInitializeResponse,
    MCPToolsListResponse,
    MCPContentType,
    MCPContent,
    MCPToolCallResponse,
  };
}
