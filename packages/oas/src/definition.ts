import type { Request, Response, NextFunction } from 'express';
import type { OpenApiSpecification } from 'swagger-route-validator';

// Extract PathDefinition from OpenApiSpecification.paths
type PathDefinition = NonNullable<OpenApiSpecification['paths']>[string];

// Extract RouteDefinition from PathDefinition methods
type RouteDefinition = NonNullable<PathDefinition['get']>;

export default function Definition(routeDefinition: RouteDefinition | PathDefinition) {
  // Basic validation - TypeScript types handle detailed schema validation
  if (!routeDefinition || typeof routeDefinition !== 'object') {
    throw new Error('Route definition must be an object');
  }

  // Check if it's a valid operation or route definition structure
  const hasHttpMethods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].some(
    method => Object.prototype.hasOwnProperty.call(routeDefinition, method),
  );

  const hasOperationFields = Object.keys(routeDefinition).some(
    key => ['summary', 'description', 'operationId', 'parameters', 'responses', 'requestBody', 'tags'].includes(key),
  );

  if (!hasHttpMethods && !hasOperationFields) {
    throw new Error('Route definition must contain either HTTP method definitions or operation fields');
  }

  function OASDefinition(req?: Request, res?: Response, next?: NextFunction) {
    if (!req) return routeDefinition;

    return next?.();
  }

  OASDefinition.OASType = 'definition';

  return OASDefinition;
}
