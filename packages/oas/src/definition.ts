export default function Definition(routeDefinition) {
  function OASDefinition(req, res, next) {
    if (!req) return routeDefinition;

    return next();
  }

  OASDefinition.OASType = 'definition';

  return OASDefinition;
}
