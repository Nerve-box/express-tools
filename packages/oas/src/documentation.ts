import { errorObject } from './utils/parameters';

const wrapModelResponse = (type: string) => {
  return { type: 'object', properties: { data: { $ref: `#/definitions/${type}` } } };
};

const wrapMetaResponse = () => {
  return { type: 'object', properties: { meta: { type: 'object' } } };
};

const defaultResponse = {
  description: 'Errors',
  type: 'object',
  required: ['errors'],
  properties: {
    errors: {
      type: 'array',
      items: errorObject,
    },
  },
};

function dataModelAsDefinition(model: _Model) {
  return {
    type: 'object',
    properties: {
      id: { type: 'string' },
      type: { type: 'string', enum: [model.type] },
      attributes: {
        type: 'object',
        properties: model.attributes,
      },
      relationships: { type: 'object', description: Object.keys(model.relationships).join(',') },
    },
  };
}

function domainAsDefinition(domain: JsonApiRoute): JsonApiRoute {
  return {
    'path': domain.path,
    'method': domain.method,
    'parameters': domain.parameters,
    'description': domain.description,
    'operationId': domain.operationId,
    'tags': domain.tags,
    'x-client-cache': domain.clientCache,
    'responses': {
      200: { schema: domain.model ? wrapModelResponse(domain.model.type) : wrapMetaResponse() },
      default: defaultResponse,
    },
  };
}

// TODO: collect field info
const swaggerBase = {
  openapi: '3.1.0',
  info: {
    description: 'The <project_name> API',
    version: '0.0.0',
    title: '<project_name> API',
  },
  servers: [
    { url: '0.0.0.0' },
  ],
  basePath: '/',
  schemes: [
    'http',
    'https',
  ],
  consumes: ['application/json', 'application/x-www-form-urlencoded'],
  produces: ['application/json'],
};

function expressTokensToSwagger(path) {
  return path.replace(/(:[a-zA-Z0-9\-_]+)/g, key => `{${key.substring(1)}}`);
}

function render(spec: any) {
  const routes = Object.keys(spec);

  console.log('routes', routes);

  return {
    ...swaggerBase,
    paths: routes.reduce((acc, route) => {
      console.log('rendering', spec[route]);
      const pathName = expressTokensToSwagger(spec[route].path);
      if (!acc[pathName]) acc[pathName] = {};
      acc[pathName][spec[route].method] = domainAsDefinition(spec[route]);
      return acc;
    }, {}),
    definitions: routes.reduce((acc, route) => {
      if (spec[route].model) acc[spec[route].model.type] = dataModelAsDefinition(spec[route].model);
      return acc;
    }, {}),
  };
}

export default function documentation() {
  function OASDocumentation(req, res, next) {
    res.json(render(req._oas.routes));

    return next();
  }

  OASDocumentation.OASType = 'documentation';

  return OASDocumentation;
}
