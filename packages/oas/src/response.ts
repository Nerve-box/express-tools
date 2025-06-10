import { expressResponseValidation } from 'swagger-route-validator';
import { formatPathToOAS } from './utils';

export default function response() {
  function OASResponse(req, res, next) {
    const operationId = formatPathToOAS(req.route.path); // TODO: handle spec basepath and potential subrouters
    const matchingSpec = req._oas?.paths?.[operationId]?.[req.method.toLowerCase()];

    if (matchingSpec) return expressResponseValidation(matchingSpec, {}, req._oas)(req, res, next);

    throw new Error(`Response validation middleware added, but no definition could be found for ${operationId}.${req.method.toLowerCase()}`);
  }

  OASResponse.OASType = 'response';

  return OASResponse;
}
