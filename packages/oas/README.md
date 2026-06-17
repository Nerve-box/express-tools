# Express tools OpenAPI compatibility

*Bring your Express API to the modern web*

- Express 5 compatible 
- Request/response validation
- Dynamically generated documentation 
- Define or redefine as much of your spec 
- Supports OpenApi 2.x, 3.x

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

const server = express();

server.use(OASRouter({
  /* An OpenAPI spec JSON Object*/
});

```

The definition middleware enables you to define or override the definition of a route in your spec.

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

The validation middleware uses the fast [swagger-route-validator](https://github.com/fed135/swagger-route-validator) to check that the request matches the spec and overrides.

```javascript

server.post(
  '/user',
  validation(),
  (req, res, next) => { /* Your business logic handler */ });

```

The response middleware adds response validation to your route, just before writing to the socket.

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

The documentation plugin prints out your spec and all overrides as JSON

```javascript

server.get('/openapi.json', documentation());

```

## Contributing

Please do! This project is all about facilitating collaboration on complex projects and we intend to set the example ourselves.
If you want to contribute, feel free to ping @fed135.

## License

Apache-2.0 - 2026
