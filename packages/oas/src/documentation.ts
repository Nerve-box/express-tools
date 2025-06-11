export default function documentation() {
  function OASDocumentation(req, res, next) {
    res.json(req._oas);

    return next();
  }

  OASDocumentation.OASType = 'documentation';

  return OASDocumentation;
}
