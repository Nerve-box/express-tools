# OAS Example - Simple API

This example demonstrates how to use the `@express-tools/oas` package to add OpenAPI support to an Express application.

## Features

- OpenAPI 3.1.0 specification
- Request validation
- Response validation
- Auto-generated documentation endpoint
- RESTful user management API

## Installation

From the repository root:

```bash
npm install
cd examples/oas
```

## Running the Example

```bash
node simple-api.ts
```

## Usage

Once running, the server will be available at `http://localhost:3000`

### View API Documentation

```bash
curl http://localhost:3000/docs
```

This returns the complete OpenAPI specification including all route definitions.

### List all users

```bash
curl http://localhost:3000/users
```

### Get a specific user

```bash
curl http://localhost:3000/users/1
```

### Create a new user

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie","email":"charlie@example.com","age":35}'
```

### Test validation (should fail)

```bash
# Missing required field 'email'
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Invalid User"}'
```

## Key Concepts

### 1. Router Setup

```typescript
import { router as OASRouter } from '@express-tools/oas';

const app = OASRouter(express(), {
  openapi: '3.1.0',
  info: { title: 'My API', version: '1.0.0' },
  components: { /* schemas */ }
});
```

### 2. Route Definitions

```typescript
app.get('/users/:id',
  definition({
    summary: 'Get a user by ID',
    parameters: [{ name: 'id', in: 'path', type: 'string' }],
    responses: { 200: { schema: { $ref: '#/components/schemas/User' } } }
  }),
  (req, res) => { /* handler */ }
);
```

### 3. Validation

```typescript
validation()  // Validates request parameters, query, body
response()    // Validates response body against schema
```

### 4. Documentation

```typescript
app.get('/docs', documentation());  // Returns OpenAPI spec as JSON
```

## Next Steps

- Add more complex schemas with nested objects
- Implement authentication with security schemes
- Add more HTTP methods (PUT, PATCH, DELETE)
- Integrate with Swagger UI for visual documentation
