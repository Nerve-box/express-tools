import { expressRequestValidation } from 'swagger-route-validator';
import { formatPathToOAS } from './utils.ts';

export default function validate() {
  function OASValidation(req, res, next) {
    if (!req.route) throw new Error('Request validation middleware must be added to a route');

    let operationId = formatPathToOAS(req.route.path);
    // subtract spec basePath if exists
    if (req._oas?.basePath && req._oas?.basePath !== '/' && operationId.indexOf(req._oas?.basePath) === 0) operationId = operationId.replace(req._oas?.basePath, '');

    const matchingSpec = req._oas?.paths?.[operationId]?.[req.method.toLowerCase()];

    if (matchingSpec) return expressRequestValidation(matchingSpec, req._oas)(req, res, next);

    throw new Error(`Request validation middleware added, but no definition could be found for ${operationId}.${req.method.toLowerCase()}`);
  }

  OASValidation.OASType = 'validation';

  return OASValidation;
}
