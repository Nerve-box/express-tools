import Express from 'express';
import OpenApiSpecification from 'swagger-route-validator';
import { expressRequestValidation, expressResponseValidation } from 'swagger-route-validator';
import { formatPathToOAS, mergeDefinitions } from './utils.ts';

interface OASRouter {
  compile: () => void
  documentation: (req, res, next) => void
  validation: (req, res, next) => void
  response: (req, res, next) => void
}

interface Spec extends Partial<OpenApiSpecification.OpenApiSpecification> {
  components: any
}

export default function router(expressApp: Express.Application, spec: Spec): OASRouter {
  // Store a working copy of the spec in express app
  const state = {
    openapi: '3.1.0',
    info: {},
    servers: [],
    basePath: '/',
    paths: {},
    components: {},
    tags: [],
  };
  mergeDefinitions(state, spec);

  if (spec.basePath && spec.basePath !== '/') {
    expressApp.mountpath = spec.basePath;
  }

  function compile() {
    const stack = expressApp.stack || expressApp.router.stack;

    // Scan routes for definition middleware
    for (let i = 0; i < stack.length; i++) {
      if (stack[i].route) {
        const definitionPlugin = stack[i].route.stack.find(middleware => middleware.handle.name === 'OASDefinition');
        if (definitionPlugin) {
          const override = definitionPlugin.handle();

          let operationId = stack[i].route.path;

          // subtract spec basePath if exists
          if (spec.basePath && spec.basePath !== '/' && operationId.indexOf(expressApp.mountpath) === 0) operationId = operationId.replace(expressApp.mountpath, '');

          // Check if path level or method level
          state.paths[formatPathToOAS(operationId)] = state.paths[formatPathToOAS(operationId)] || {};
          if (override[definitionPlugin.method]) mergeDefinitions(state.paths[formatPathToOAS(operationId)], override);
          else mergeDefinitions(state.paths[formatPathToOAS(operationId)], { [definitionPlugin.method]: override });
        }
      }
    }
  }

  function documentation(req, res) {
    res.json(state);
  }

  function validation(req, res, next) {
    if (!req.route) throw new Error('Request validation middleware must be added to a route');

    let operationId = formatPathToOAS(req.route.path);
    // subtract spec basePath if exists
    if (state.basePath && state.basePath !== '/' && operationId.indexOf(state.basePath) === 0) operationId = operationId.replace(state.basePath, '');

    const matchingSpec = state.paths?.[operationId]?.[req.method.toLowerCase()];

    if (matchingSpec) return expressRequestValidation(matchingSpec, state)(req, res, next);

    throw new Error(`Request validation middleware added, but no definition could be found for ${operationId}.${req.method.toLowerCase()}`);
  }

  function response(req, res, next) {
    if (!req.route) throw new Error('Response validation middleware must be added to a route');

    let operationId = formatPathToOAS(req.route.path);
    // subtract spec basePath if exists
    if (state.basePath && state.basePath !== '/' && operationId.indexOf(state.basePath) === 0) operationId = operationId.replace(state.basePath, '');
    const matchingSpec = state.paths?.[operationId]?.[req.method.toLowerCase()];

    if (matchingSpec) return expressResponseValidation(matchingSpec, {}, state)(req, res, next);

    throw new Error(`Response validation middleware added, but no definition could be found for ${operationId}.${req.method.toLowerCase()}`);
  }

  return { compile, documentation, validation, response };
}
