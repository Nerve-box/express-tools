function guardAgainstBadRouteIntegrity(route: _Route, specifications: RouterSpecifications) {
  if (!(specifications.supportedMethods.includes(route.method))) throw new Error(`Invalid route verb ${route.method}`);
  if (route.method !== 'get') return;

  const pathParameterCount = route.path.match(/\/:/g)?.length || 0;
  const pathParameters = route.parameters.filter(p => p.in === 'path');
  if (pathParameterCount !== pathParameters.length) {
    throw new Error(
      `Route path should contain ${pathParameters.length} parameters,`
      + ` only ${pathParameterCount} are declared (tags: ${route.tags.join('/')})`,
    );
  }

  pathParameters.forEach((parameter) => {
    if (!route.path.match(new RegExp(`/:${parameter.name}`))) {
      throw new Error(`Route parameter '${parameter.name}' not found in route path (tags: ${route.tags.join('/')}).`);
    }
  });
}

export function register(route: _Route, router, specifications: RouterSpecifications) {
  if (!route.operationId) throw new Error(`Missing operation id for new route ${route.path}`);
  if (!route.resolver) throw new Error(`Missing resolver for new route ${route.path}`);

  const topics = (route.path || '/').split('/');

  route.path = route.path || '/';
  route.method = route.method || 'get';
  route.description = route.description || `${this.method} ${topics[topics.length - 1]}`;
  route.parameters = route.parameters || [];
  route.tags = route.tags || [topics[topics.length - 1]];

  guardAgainstBadRouteIntegrity(route, specifications);

  router._spec[`${route.method} ${route.path}`] = route;
  router[route.method](
    route.path, ...route.middlewares || [],
    link(route.resolver, route.model, route.clientCache, specifications),
  );
}

export default function router(expressApp, config) {
  // Validate app

  // Validate config ex:
  /*
{
  schemas: {
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' required: true },
        name: { type: 'string' },
        age: { type: 'number' },
      },
    },
  },
  */

  // Store config in express app
  expressApp.oas = Object.assign(config, { routes: {} });

  // Append config to request to prevent gymnastics
  function OASRouter(req, res, next) {
    req._oas = expressApp.oas;
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
        const definition = expressApp.router.stack[i].route.stack.find(middleware => middleware.handle.OASType === 'definition');
        if (definition) {
          // Validate + Fill missing fields in definition
          const compiled = definition.handle();
          compiled.path = expressApp.router.stack[i].route.path;
          compiled.method = definition.method;
          compiled.operationId = compiled.operationId || `${definition.method} ${expressApp.router.stack[i].route.path}`;

          // OAS specifics, ex: path params should be required

          // Add definition to router object, as a fast-reference for validation and documentation
          expressApp.oas.routes[`${definition.method} ${expressApp.router.stack[i].route.path}`] = compiled;

          // Definition middleware sits in front and attaches the correct OAS definition in the request object
        }
      }
    }

    return defaultListen.call(expressApp, port, callback);
  }
  expressApp.listen = listen;

  return expressApp;
}
