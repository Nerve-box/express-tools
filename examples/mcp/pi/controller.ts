import { PICalc } from './utils/math';

export function calculate(req, res) {
  res.json(PICalc(req.params.decimals));
}
