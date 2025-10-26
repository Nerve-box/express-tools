import Express from 'express';
import { JSONRPCServer } from 'json-rpc-2.0';
import { deferred } from './utils';

interface MCPRouter extends Express.Express {
  _mcp: {
    tools: { [name: string]: any }
    handlers: { [name: string]: any }
    server: JSONRPCServer
  }
}

export default function router(expressApp: MCPRouter, spec = {}): MCPRouter {
  if (!spec.serverInfo) throw new Error('serverInfo is missing from MCP config.');

  let scanned: boolean = false;

  // Store a working copy of the spec in express app
  expressApp['_mcp'] = {
    tools: (spec.tools || []).reduce((acc, curr) => {
      acc[curr.name] = curr;
      return acc;
    }, {}),
    handlers: spec.handlers || {},
    server: new JSONRPCServer(),
  };

  // Append config to request to prevent gymnastics
  function MCPRouter(req, res, next) {
    req._mcp = expressApp['_mcp'];
    return next();
  }
  MCPRouter.MCPType = 'router';
  expressApp.use(Express.json());
  expressApp.use(MCPRouter);

  function initMCPRouter() {
    if (scanned) throw new Error('MCP Router has already scanned for routes. Make sure it is only invoked once.');
    scanned = true;

    const stack = expressApp.stack || expressApp.router.stack;

    expressApp._mcp.server.addMethod('initialize', () => ({
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {
          listChanged: false,
        },
      },
      serverInfo: spec.serverInfo,
    }));
    expressApp._mcp.server.addMethod('tools/list', () => ({ tools: Object.values(expressApp._mcp.tools) }));
    expressApp._mcp.server.addMethod('tools/call', ({ name, arguments: args }, req) => {
      const outputType = expressApp._mcp.tools[name].outputSchema?.properties?.type?.type || 'text';

      const { promise, resolve } = deferred();
      const payload = Object.assign(req || {}, { params: Object.assign(req.params, args) });
      if (args.body) {
        payload.body = args.body;
        delete payload.params.body;
      }

      const response = expressApp._mcp.handlers[name].call(req, payload, { json: resolve });

      return promise.then(data => ({ content: [{ type: outputType, [outputType]: data || response }] }));
    });

    // Scan routes for definition middleware
    for (let i = 0; i < stack.length; i++) {
      if (stack[i].route) {
        const definitionPlugin = stack[i].route.stack.find(middleware => middleware.handle['MCPType'] === 'definition');
        if (definitionPlugin) {
          const override = definitionPlugin.handle();
          const operationId = override && override.name;

          expressApp['_mcp'].tools[operationId] = override;
          expressApp['_mcp'].handlers[operationId] = override.handler || stack[i].route.stack.at(-1).handle;
        }
      }
    }

    expressApp.post(spec.basePath || '/mcp', (req, res) => {
      const jsonRPCRequest = req.body;
      expressApp._mcp.server.receive(jsonRPCRequest, req).then((jsonRPCResponse) => {
        if (jsonRPCResponse) {
          res.json(jsonRPCResponse);
        }
        else {
          res.sendStatus(204);
        }
      }, (error) => {
        res.sendStatus(500);
        res.json({ error });
      });
    });
  }

  if (expressApp.listen) {
    // Override listen
    const defaultListen = expressApp.listen;
    function listen(...args) {
      initMCPRouter();

      return defaultListen.apply(expressApp, args);
    }
    expressApp.listen = listen;
  }

  return expressApp;
}
