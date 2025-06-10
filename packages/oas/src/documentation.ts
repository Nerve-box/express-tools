const swaggerBase = {
  openapi: '3.1.0',
  info: {},
  servers: [],
  basePath: '/',
  paths: {},
  components: {},
  tags: [],
};

export default function documentation() {
  function OASDocumentation(req, res, next) {
    res.json(Object.assign(swaggerBase, req._oas));

    return next();
  }

  OASDocumentation.OASType = 'documentation';

  return OASDocumentation;
}
