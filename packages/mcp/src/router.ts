import Express from 'express';
import { JSONRPCServer } from 'json-rpc-2.0';
import { deferred } from './utils.ts';

interface MCPRouter {
  compile: () => void
}

export default function router(expressApp: Express.Application, spec = {}): MCPRouter {
  if (!spec.serverInfo) throw new Error('serverInfo is missing from MCP config.');

  // Internal state
  const state = {
    tools: (spec.tools || []).reduce((acc, curr) => {
      acc[curr.name] = curr;
      return acc;
    }, {}),
    handlers: spec.handlers || {},
    server: new JSONRPCServer(),
  };

  function compile() {
    const stack = expressApp.stack || expressApp.router.stack;

    state.server.addMethod('initialize', () => ({
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {
          listChanged: false,
        },
      },
      serverInfo: spec.serverInfo,
    }));
    state.server.addMethod('tools/list', () => ({ tools: Object.values(state.tools) }));
    state.server.addMethod('tools/call', ({ name, arguments: args }, req) => {
      const outputType = state.tools[name].outputSchema?.properties?.type?.type || 'text';

      const { promise, resolve } = deferred();
      const payload = { params: Object.assign({}, req.params, args), query: Object.assign({}, req.query, args), headers: req.headers };
      if (args.body) {
        payload.body = args.body;
        delete payload.params.body;
      }

      const mockedRes = { json: resolve, end: resolve };
      mockedRes.status = () => mockedRes;
      const response = state.handlers[name].call(req, payload, mockedRes);

      return promise.then(data => ({ content: [{ type: outputType, [outputType]: data || response }] }));
    });

    // Scan routes for definition middleware
    for (let i = 0; i < stack.length; i++) {
      if (stack[i].route) {
        const definitionPlugin = stack[i].route.stack.find(middleware => middleware.handle.name === 'MCPDefinition');
        if (definitionPlugin) {
          const override = definitionPlugin.handle();
          const operationId = override && override.name;

          state.tools[operationId] = override;
          state.handlers[operationId] = override.handler || stack[i].route.stack.at(-1).handle;
        }
      }
    }
  }

  expressApp.post(spec.basePath || '/mcp', Express.json(), (req, res) => {
    const jsonRPCRequest = req.body;
    state.server.receive(jsonRPCRequest, req).then((jsonRPCResponse) => {
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

  return { compile };
}
