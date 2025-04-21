import check from 'swagger-route-validator'

/* function guardAgainstForbiddenIncludePattern(includeVal: string[], includeParam?: Serializable, context?: _Context) {
  if (!includeVal || includeVal.length === 0) return;
  if (!includeParam) return;

  const includeRules = includeParam['x-include-rules'] || {};
  const relationships = includeParam['x-direct-relations'];
  const whitelist = includeRules.whitelist || [];
  const blacklist = includeRules.blacklist || [];
  let maxDepth = includeRules['max-depth'];
  if (maxDepth === null || maxDepth === undefined) maxDepth = 3;

  for (let i = 0; i < includeVal.length; i++) {
    const rejectReason = (
      ((includeVal[i].split('.').length > maxDepth && !whitelist.includes(includeVal[i])) && 'Too much nesting') ||
      (blacklist.includes(includeVal[i]) && 'Relationship forbidden') ||
      (!relationships.includes(includeVal[i].split('.')[0]) && 'Not a relationship') ||
      null
    );

    if (rejectReason !== null) throw new Error(`Invalid include value ${includeVal[i]}: ${rejectReason}`);
  }
} */

export default function validate() {
  function OASValidation(req, res, next) {
    // TODO: validate that req.route exists- it should be invoked as a middleware, not a root-level plugin

    const operationId = `${req.method.toLowerCase()} ${req.route.path}`
    const matchingSpec = req._oas?.routes[operationId]

    if (matchingSpec) {
      const errors = check(matchingSpec, req)
      if (errors.length > 0) {
        const errObj = new Error(JSON.stringify(errors))
        errObj.statusCode = 400
        delete errObj.stack
        return next(errObj)
      }
    }

    return next()
  }

  OASValidation.OASType = 'validation'

  return OASValidation
}
