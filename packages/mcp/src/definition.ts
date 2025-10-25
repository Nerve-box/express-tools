import type { Request, Response, NextFunction } from 'express';

// Extract MCPToolDefinition from the package's own types.d.ts
type MCPToolDefinition = Parameters<typeof import('../types')['definition']>[0];

export default function Definition(routeDefinition: MCPToolDefinition) {
  // Basic validation - TypeScript types handle detailed schema validation
  if (!routeDefinition || typeof routeDefinition !== 'object') {
    throw new Error('Tool definition must be an object');
  }

  if (!routeDefinition.name || typeof routeDefinition.name !== 'string') {
    throw new Error('MCP tool definition is missing property "name" (must be a string)');
  }

  if (!routeDefinition.inputSchema || typeof routeDefinition.inputSchema !== 'object') {
    throw new Error('MCP tool definition is missing property "inputSchema" (must be an object)');
  }

  // outputSchema is optional but should be an object if provided
  if (routeDefinition.outputSchema !== undefined && typeof routeDefinition.outputSchema !== 'object') {
    throw new Error('MCP tool definition "outputSchema" must be an object if provided');
  }

  // Validate handler is a function if provided
  if (routeDefinition.handler !== undefined && typeof routeDefinition.handler !== 'function') {
    throw new Error('MCP tool definition "handler" must be a function if provided');
  }

  function MCPDefinition(req?: Request, res?: Response, next?: NextFunction) {
    if (!req) return routeDefinition;

    req._MCPOperationId = routeDefinition.name;

    return next?.();
  }

  MCPDefinition.MCPType = 'definition';

  return MCPDefinition;
}
