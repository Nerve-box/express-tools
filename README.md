# Express-tools

*Bring your Express API to the modern web*

## What is it?

Express-tools is a suite of protocol interop plugins for the [express](https://expressjs.com/en/) web framework.

Because Express and Express-like routing has been around for over 15 years and currently holds [over 7% of the web frameworks market share], there are a good number of potentially older live services that could be too fragile to migrate to something newer if the owners suddenly wanted to add MCP support. 

The plugin system of Express-tools doesn't wrap, overload, or play with any Express internals and works on both legacy Express (pre-5.x) and the current LTS. This ensures that existing business logic remains unaffected.

No new framework to learn, no monkey patching. 

The goal of these plugins is to make it dead simple to add protocol interop to existing applications, reducing new-framework fatigue.

Important disclaimer: We are not associated in any way with the core Express team.


## Examples

### Moving from static json/yaml OpenAPI specs to dynamically generated docs that live with the code.

A common scenario when working with API gateways is that you feed them statically generated API definitions. This causes friction in development and can result in drifting. The language for these definitions is disconnected from any intellisense or validation.

Larger APIs also deal with massive definition files and must repeat common responses, headers, etc. multiple times.

By defining routes as plain objects in the code, we gain insight from intellisense and can leverage [@express-tool/oas](./packages/oas/) to create a documentation route which dynamically outputs the API definition.

```javascript

import Express from 'express';
import {definition, documentation, router as OASRouter} from '@express-tools/oas';

const server = express();

server.use(OASRouter({
  /* An OpenAPI spec JSON Object*/
});

server.get('/user/:id', definition({
  description: 'Get a User by Id',
  parameters: [
    { 
      name: 'id',
      in: 'path',
      type: 'string',
    }
  ],
  responses: {
    default: { schema: { $ref: '#/definitions/user' } },
  },
}), (req, res, next) => { /* Your business logic handler */ });


server.get('/openapi.json', documentation());

```

In this example, we took an existing Express app with a `GET /user/:id` route and added the `server.use(OASRouter(...))` to initialize the OpenAPI router. Then, we added a `definition` middleware to the `GET /user/:id` route. Finally, we created a new route to print out the spec.

Now, instead of feeding a static spec to our API gateway, it can be fetched dynamically from the API itself.

### Adding MCP support to a legacy Express app

Assuming that you have a legacy web service that connects to a database or performs some sort of compute which would be useful for an LLM to have as a tool, the current approach is to develop a secondary service using one of many bespoke standalone frameworks which communicates with your legacy service. 

Not only is this wasteful, but it also introduces new potential points of failure, attack surface, etc. You may be re-writing a lot of authentication flows, creating exceptions for LLM tool calling, etc.

[@express-tools/mcp](./packages/mcp/) is a plugin that allows you to reuse your existing app and endpoints as MCP tools.

```javascript
import Express from 'express';
import { definition, router as MCPRouter } from '@express-tools/mcp';

// Wraps an existing Express app and adds MCP protocol support
const server = express();

server.use('/mcp', MCPRouter({
  serverInfo: {
    name: 'my-calculator-service',
    version: '1.0.0',
  },
}));

server.post('/calculate', definition({
  name: 'calculate',
  description: 'Performs basic arithmetic operations',
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['add', 'subtract', 'multiply', 'divide'],
      },
      a: { type: 'number' },
      b: { type: 'number' },
    },
    required: ['operation', 'a', 'b'],
  },
}), (req, res) => {
  const { operation, a, b } = req.body;
  let result;

  switch (operation) {
    case 'add': result = a + b; break;
    case 'subtract': result = a - b; break;
    case 'multiply': result = a * b; break;
    case 'divide': result = a / b; break;
  }

  res.json(result);
});
```

In this example, our legacy app has one endpoint: `/calculate`. Under the hood, adding the `MCPRouter` plugin to our Express app spins up a JSON-RPC server and binds it to the route `/mcp`. Invoking the `definition` middleware creates a tool definition internally. 

Now, LLMs can connect to the API directly via the `/mcp` endpoint.

## Contributing

Please do! This project is all about facilitating collaboration on complex projects and we intend to set the example ourselves.
If you want to contribute, feel free to ping @fed135.

## Special thanks

The concept, which is not new and has been attempted a few times- even by myself.
This iteration has been thoroughly battle-tested in personal projects.

A very special shoutout to [@drawm](https://github.com/drawm), [@mats852](https://github.com/mats852), [@emeraldsanto](https://github.com/emeraldsanto) and the many others that helped me write the early iterations of this.

## TODO

- Replace app wrapping with Express .use() syntax.
- Replace .listen() overloading with .on('mount').
- Benchmark OAS validation against Zod


## Roadmap

- [ ] JSON-RPC plugin
- [ ] GraphQL plugin
- [ ] Websockets plugin


## License

Apache-2.0 - 2026
