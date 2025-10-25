export default function documentation() {
  function OASDocumentation(req, res) {
    res.json(req._oas);
  }

  OASDocumentation.OASType = 'documentation';

  return OASDocumentation;
}
