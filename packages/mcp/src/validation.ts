import { expressRequestValidation } from 'swagger-route-validator';

export default function validate() {
  function MCPValidation(req, res, next) {
    if (!req.route) throw new Error('Request validation middleware must be added to a route');
    if (!req._MCPOperationId) throw new Error(`Request validation middleware failed to find a definition for route ${req.route.path}. Make sure the definition middleware has been called first.`);

    const matchingSpec = req._mcp.tools[req._MCPOperationId];
    if (matchingSpec) return expressRequestValidation(matchingSpec)(req, res, next);

    throw new Error(`Request validation middleware added, but no definition could be found for ${req._MCPOperationId}`);
  }

  MCPValidation.MCPType = 'validation';

  return MCPValidation;
}
