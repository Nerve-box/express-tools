import { expressRequestValidation } from 'swagger-route-validator';
import { formatPathToOAS } from './utils';

export default function validate() {
  function OASValidation(req, res, next) {
    if (!req.route) throw new Error('Validation middleware must be added to a route');

    const operationId = formatPathToOAS(req.route.path); // TODO: handle spec basepath and potential subrouters
    const matchingSpec = req._oas?.paths?.[operationId]?.[req.method.toLowerCase()];

    if (matchingSpec) return expressRequestValidation(matchingSpec, req._oas)(req, res, next);

    throw new Error(`Request validation middleware added, but no definition could be found for ${operationId}.${req.method.toLowerCase()}`);
  }

  OASValidation.OASType = 'validation';

  return OASValidation;
}
