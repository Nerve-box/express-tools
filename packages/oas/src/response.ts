import {expressResponseValidation} from 'swagger-route-validator';

export default function response(handler) {
  function OASResponse(req, res, next) {
    // TODO: validate that req.route exists and definition exists for route- it should be invoked as a middleware, not a root-level plugin

    const operationId = `${req.method.toLowerCase()} ${req.route.path}`;
    const matchingSpec = req._oas?.routes[operationId];

    return expressResponseValidation(matchingSpec, {}, req._oas)(req, res, next);
  }

  OASResponse.OASType = 'response';

  return OASResponse;
}
