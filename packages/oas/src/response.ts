import check from 'swagger-route-validator';
import {deferred} from './utils/async';

export default function response(handler) {
  function OASResponse(req, res, next) {
    // TODO: validate that req.route exists and definition exists for route- it should be invoked as a middleware, not a root-level plugin

    const operationId = `${req.method.toLowerCase()} ${req.route.path}`;
    const matchingSpec = req._oas?.routes[operationId];
    let method;
    let buffer;

    const {resolve, promise} = deferred();
    const hook = {
      append:res.append,
      attachment: res.attachment,
      cookie: res.cookie,
      clearCookie: res.clearCookie,
      download: res.download,
      end: (b) => {method = 'end'; buffer = b;},
      format: res.format,
      get: res.get,
      json: (b) => {method = 'json'; buffer = b;},
      jsonp: res.jsonp,
      links: res.links,
      location: res.location,
      redirect: res.redirect,
      render: res.render,
      send: (b) => {method = 'send'; buffer = b;},
      sendFile: res.sendFile,
      sendStatus: res.sendStatus,
      set: res.set,
      status: res.status,
      type: res.type,
      vary: res.vary,
      write: (b) => {method = 'write'; buffer = b;},
    }

    handler(req, hook, resolve);

    // Need to augment SRV to allow passing a path/reponse body

    promise.then(() => {
      console.log('finished handler method: ', method, 'buffer', buffer, 'spec', matchingSpec?.responses[res.statusCode] || matchingSpec?.responses.default);
      if (matchingSpec?.responses[res.statusCode] || matchingSpec?.responses.default) {
        const errors = check(matchingSpec?.responses[res.statusCode] || matchingSpec?.responses.default, buffer);
        if (errors.length > 0) {
          const errObj = new Error(JSON.stringify(errors));
          errObj.statusCode = 422;
          delete errObj.stack;
          return next(errObj);
        }
      }
  
      res[method](buffer);
      return next();
    });
  }

  OASResponse.OASType = 'response';

  return OASResponse;
}
