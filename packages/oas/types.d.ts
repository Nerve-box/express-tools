import { OpenApiSpecification } from 'swagger-route-validator';
import { Express } from 'express';

interface RouteDefinitionOverride {
  get: any
}

declare module '@express-tools/oas' {
  export function definition(override: RouteDefinitionOverride);
  export function documentation();
  export function response();
  export function router(app: Express, spec: OpenApiSpecification);
  export function validation();
}
