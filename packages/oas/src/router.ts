import { Express } from 'express';
import { OpenApiSpecification } from 'swagger-route-validator';
import { formatPathToOAS, mergeDefinitions } from './utils';

interface OASRouter extends Express {
  scan?: () => void
}

interface Spec extends Partial<OpenApiSpecification> {
  components: any
}

export default function router(expressApp: OASRouter, spec: Spec): OASRouter {
  let scanned: boolean = false;

  // Store a working copy of the spec in express app
  expressApp['_oas'] = {
    openapi: '3.1.0',
    info: {},
    servers: [],
    basePath: '/',
    paths: {},
    components: {},
    tags: [],
  };
  mergeDefinitions(expressApp['_oas'], spec);

  // Append config to request to prevent gymnastics
  function OASRouter(req, res, next) {
    req._oas = expressApp['_oas'];
    return next();
  }
  OASRouter.OASType = 'router';
  expressApp.use(OASRouter);

  if (spec.basePath && spec.basePath !== '/') {
    expressApp.mountpath = spec.basePath;
  }

  function initOASRouter() {
    if (scanned) throw new Error('OAS Router has already scanned for routes. Make sure it is only invoked once.');
    scanned = true;

    const stack = expressApp.stack || expressApp.router.stack;

    // Scan routes for definition middleware
    for (let i = 0; i < stack.length; i++) {
      if (stack[i].route) {
        const definitionPlugin = stack[i].route.stack.find(middleware => middleware.handle.OASType === 'definition');
        if (definitionPlugin) {
          const override = definitionPlugin.handle();

          let operationId = stack[i].route.path;

          // substract spec baspath if exists
          if (spec.basePath && spec.basePath !== '/' && operationId.indexOf(expressApp.mountpath) === 0) operationId = operationId.replace(expressApp.mountpath, '');

          // Check if path level or method level
          expressApp['_oas'].paths[formatPathToOAS(operationId)] = expressApp['_oas'].paths[formatPathToOAS(operationId)] || {};
          if (override[definitionPlugin.method]) mergeDefinitions(expressApp['_oas'].paths[formatPathToOAS(operationId)], override);
          else mergeDefinitions(expressApp['_oas'].paths[formatPathToOAS(operationId)], { [definitionPlugin.method]: override });
        }
      }
    }
  }

  expressApp.scan = initOASRouter;

  if (expressApp.listen) {
    // Override listen
    const defaultListen = expressApp.listen;
    function listen(...args) {
      initOASRouter();

      return defaultListen.apply(expressApp, args);
    }
    expressApp.listen = listen;
  }

  return expressApp;
}
