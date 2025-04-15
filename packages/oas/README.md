# Express tools OpenAPI compatibility

*Bring your Express API to the modern web*

## Getting started

### Installation

To add Open-API compatibility to your service:

```bash
npm i @express-tools/oas
```

```javascript

import Express from 'express';
import {definition, documentation, response as OASResponse, router as OASRouter, validation} from '@express-tools/oas';

// Wraps your existing API router or subrouter
// Load your schemas in place, which the plugin will connect via OAS' $Ref
const server = OASRouter(express(), {
  schemas: {
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' required: true },
        name: { type: 'string' },
        age: { type: 'number' },
      },
    },
  },
});

// You may opt to use the plugin's OAS validator instead of manually checking each field with a 3rd party validation package.
server.use(validation());

// The definition plugin allows the OAS plugin to detect this endpoint and enable validation, auto-generated documentation, etc.
// Many route properties will be automatically derived from express, though they can be overwritten.
server.get('/user/:id', definition({
  method: 'get',
  operationId: 'getUserById',
  description: 'Get a User by Id',
  parameters: [
    { 
      name: 'id',
      in: 'path',
      type: 'string',
    }
  ],
  responses: {
    default: { schema: { "$ref": "#/components/schemas/user" } },
  },
}), (req, res, next) => { /* Your business logic handler */ });

// Optionally, you can modify your existing route's response format to OAS with the 'response' plugin, which wraps your final handler.
server.post('/user', definition({
  operationId: 'createUser',
  description: 'Creates a user',
  parameters: [
    { 
      name: 'body',
      in: 'body',
      schema: { "$ref": "#/components/schemas/user" },
    }
  ],
  responses: {
    default: { schema: { "$ref": "#/components/schemas/user" } },
  },
}), response((req, res, next) => { /* Your business logic handler */ }));

server.get('/docs', documentation());

server.listen(9001, () => {
  console.log(`App listening on port 9001`)
});

```

## Contributing

Please do! This project is all about facilitating collaboration on complex projects and we intend to set the example ourselves.
If you want to contribute, feel free to ping @fed135.

## License

Apache-2.0 - 2025
