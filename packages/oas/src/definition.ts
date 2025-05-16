export default function Definition(routeDefinition: any) {
  function OASDefinition(req?: Express.Request, res?: Express.Response, next?: any) {
    if (!req) return routeDefinition;

    return next();
  }

  OASDefinition.OASType = 'definition';

  return OASDefinition;
}
