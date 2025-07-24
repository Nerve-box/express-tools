export default function Definition(routeDefinition: any) {
  // TODO: Validate input?

  function MCPDefinition(req?: Express.Request, res?: Express.Response, next?: any) {
    if (!routeDefinition.name) throw new Error(`MCP tool definition is missing property "name"`);
    if (!routeDefinition.inputSchema) throw new Error(`MCP tool definition is missing property "inputSchema"`);
    if (!routeDefinition.outputSchema) throw new Error(`MCP tool definition is missing property "outputSchema"`);

    if (!req) return routeDefinition;

    req._MCPOperationId = routeDefinition.name;

    return next();
  }

  MCPDefinition.MCPType = 'definition';

  return MCPDefinition;
}
