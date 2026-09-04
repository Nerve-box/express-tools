import { PICalc } from '../utils/math.ts';

export function calculate(req, res) {
  res.json(PICalc(req.params.decimals));
}
