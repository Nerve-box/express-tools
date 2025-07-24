import * as PI from './model.ts';

export function calculate(req, res, next) {
    res.json(PI.calculate(req.params.decimals));
    next();
}
