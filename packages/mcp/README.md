# Express tools MCP compatibility

*Bring your Express API to the modern web*

- Express 5 compatible
- Adds MCP interop to your express app via JSON-RPC2
- 
- Request body validation

## Getting started

### Installation

```bash
npm i @express-tools/oas
```
### Usage

Add the plugin to your express app:

```javascript

import Express from 'express';
import {definition, documentation, response, router as OASRouter, validation} from '@express-tools/oas';

// Wraps an existing API router or subrouter and adds an OpenAPI spec
const server = OASRouter(express(), {
  /* An OpenAPI spec */
});

```

The definition middleware enables you to define or override the properties of a route

```javascript

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

```

The validation middleware checks the request to make sure it matches the spec and overrides.

```javascript

server.post(
  '/user',
  validation(),
  (req, res, next) => { /* Your business logic handler */ });

```

The response middleware adds response validation to your route

```javascript

server.post(
  '/user',
  definition({
    description: 'Creates a user',
    parameters: [
      { 
        name: 'body',
        in: 'body',
        schema: { $ref: 'user' },
      }
    ],
    responses: {
      default: { schema: { $ref: 'user' } },
    },
  }),
  response(),
  (req, res, next) => { /* Your business logic handler */ });

```

The documentation plugin prints out your spec and all overrides

```javascript

server.get('/docs', documentation());

```

## Contributing

Please do! This project is all about facilitating collaboration on complex projects and we intend to set the example ourselves.
If you want to contribute, feel free to ping @fed135.

## License

Apache-2.0 - 2025
