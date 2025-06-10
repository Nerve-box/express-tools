import { Express } from 'express';
import { OpenApiSpecification } from 'swagger-route-validator';
import { formatPathToOAS, mergeDefinitions } from './utils';

export default function router(expressApp: Express, spec: OpenApiSpecification): Express {
  // Store a working copy of the spec in express app
  expressApp['_oas'] = Object.assign({}, spec);

  // Append config to request to prevent gymnastics
  function OASRouter(req, res, next) {
    req._oas = expressApp['_oas'];
    return next();
  }
  OASRouter.OASType = 'router';
  expressApp.use(OASRouter);

  // Override listen
  const defaultListen = expressApp.listen;
  function listen(port, callback) {
    // Scan routes for definition middleware
    for (let i = 0; i < expressApp.router.stack.length; i++) {
      if (expressApp.router.stack[i].route) {
        const definitionPlugin = expressApp.router.stack[i].route.stack.find(middleware => middleware.handle.OASType === 'definition');
        if (definitionPlugin) {
          const override = definitionPlugin.handle();

          // Check if path level or method level
          expressApp['_oas'].paths[formatPathToOAS(expressApp.router.stack[i].route.path)] = expressApp['_oas'].paths[formatPathToOAS(expressApp.router.stack[i].route.path)] || {};
          if (override[definitionPlugin.method]) mergeDefinitions(expressApp['_oas'].paths[formatPathToOAS(expressApp.router.stack[i].route.path)], override);
          else mergeDefinitions(expressApp['_oas'].paths[formatPathToOAS(expressApp.router.stack[i].route.path)], { [definitionPlugin.method]: override });
        }
      }
    }

    return defaultListen.call(expressApp, port, callback);
  }
  expressApp.listen = listen;

  return expressApp;
}
