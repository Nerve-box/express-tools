import check from 'swagger-route-validator';

export default function validate() {
  function OASValidation(req, res, next) {
    // TODO: validate that req.route exists- it should be invoked as a middleware, not a root-level plugin

    const operationId = `${req.method.toLowerCase()} ${req.route.path}`;
    const matchingSpec = req._oas?.routes[operationId];

    if (matchingSpec) {
      const errors = check(matchingSpec, req);
      if (errors.length > 0) {
        const errObj = new Error(JSON.stringify(errors));
        errObj.statusCode = 400;
        delete errObj.stack;
        return next(errObj);
      }
    }

    return next();
  }

  OASValidation.OASType = 'validation';

  return OASValidation;
}
