import Express from 'express';
import { JSONRPCServer } from 'json-rpc-2.0';

interface MCPRouter extends Express.Express {
  _mcp: {
    tools: { [name: string]: any }
    handlers: { [name: string]: any }
    server: JSONRPCServer
  }
}


export default function router(expressApp: MCPRouter, spec = {}): MCPRouter {

  if (!spec.serverInfo) throw new Error('serverInfo is missing from MCP config.');


  // Store a working copy of the spec in express app
  expressApp['_mcp'] = {
    tools: (spec.tools || []).reduce((acc, curr) => { acc[curr.name] = curr; return curr;}, {}),
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
    const stack = expressApp.stack || expressApp.router.stack;

    expressApp._mcp.server.addMethod('initialize', () => ({
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {
          listChanged: false
        }
      },
      serverInfo: spec.serverInfo,
    }));
    expressApp._mcp.server.addMethod('tools/list', () => ({ tools: Object.values(expressApp._mcp.tools)}));
    expressApp._mcp.server.addMethod('tools/call', ({ name, arguments: args}) => expressApp._mcp.handlers[name].call(null, { params: args }));

    // Scan routes for definition middleware
    for (let i = 0; i < stack.length; i++) {
      if (stack[i].route) {
        const definitionPlugin = stack[i].route.stack.find(middleware => middleware.handle.MCPType === 'definition');
        if (definitionPlugin) {
          const override = definitionPlugin.handle();

          let operationId = override && override.name;

          expressApp['_mcp'].tools[operationId] = override;
          expressApp['_mcp'].handlers[operationId] = stack[i].route.stack.at(-1).handle;
        }
      }
    }

    expressApp.post(spec.basePath || '/mcp', (req, res, next) => {
      const jsonRPCRequest = req.body;
      console.log('body: ', jsonRPCRequest)
  
      expressApp._mcp.server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
        if (jsonRPCResponse) {
          res.json(jsonRPCResponse);
        } else {
          res.sendStatus(204);
        }
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
