import { OpenApiSpecification } from 'swagger-route-validator';
import { Express } from 'express';

interface RouteDefinitionOverride {
  get: any
}

interface OASRouter extends Express {
  scan: () => void
}

interface Spec extends Partial<OpenApiSpecification> {
  components: any
}

declare module '@express-tools/oas' {
  export function definition(override: RouteDefinitionOverride);
  export function documentation();
  export function response();
  export function router(app: Express, spec: Spec): OASRouter;
  export function validation();
}
