/**
 * Simple Express API with OpenAPI (OAS) plugin
 *
 * This example demonstrates:
 * - Setting up an OAS-enhanced Express server
 * - Defining routes with OpenAPI metadata
 * - Request and response validation
 * - Auto-generated API documentation
 *
 * Run with: node --experimental-strip-types simple-api.ts
 * Then visit: http://localhost:3000/docs
 */

import express from 'express';
import { definition, documentation, response, router as OASRouter, validation } from '@express-tools/oas';

// Define the OpenAPI specification
const apiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Simple User API',
    version: '1.0.0',
    description: 'A simple example API with user management',
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'User ID' },
          name: { type: 'string', description: 'User name' },
          email: { type: 'string', format: 'email', description: 'User email' },
          age: { type: 'integer', minimum: 0, description: 'User age' },
        },
        required: ['id', 'name', 'email'],
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
};

// Initialize OAS-enhanced Express app
const app = OASRouter(express(), apiSpec);

// Simple in-memory user store
const users: Record<string, { id: string, name: string, email: string, age?: number }> = {
  1: { id: '1', name: 'Alice', email: 'alice@example.com', age: 30 },
  2: { id: '2', name: 'Bob', email: 'bob@example.com', age: 25 },
};

// GET /users - List all users
app.get('/users',
  definition({
    summary: 'List all users',
    description: 'Returns a list of all users in the system',
    responses: {
      200: {
        description: 'List of users',
        schema: {
          type: 'array',
          items: { $ref: '#/components/schemas/User' },
        },
      },
    },
  }),
  response(),
  (req, res) => {
    res.json(Object.values(users));
  },
);

// GET /users/:id - Get a user by ID
app.get('/users/:id',
  definition({
    summary: 'Get a user by ID',
    description: 'Returns a single user by their ID',
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        description: 'User ID',
      },
    ],
    responses: {
      200: {
        description: 'User found',
        schema: { $ref: '#/components/schemas/User' },
      },
      404: {
        description: 'User not found',
        schema: { $ref: '#/components/schemas/Error' },
      },
    },
  }),
  validation(),
  response(),
  (req, res) => {
    const user = users[req.params.id];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  },
);

// POST /users - Create a new user
app.post('/users',
  definition({
    summary: 'Create a new user',
    description: 'Creates a new user in the system',
    parameters: [
      {
        name: 'body',
        in: 'body',
        required: true,
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            age: { type: 'integer', minimum: 0 },
          },
          required: ['name', 'email'],
        },
      },
    ],
    responses: {
      201: {
        description: 'User created',
        schema: { $ref: '#/components/schemas/User' },
      },
      400: {
        description: 'Invalid request',
        schema: { $ref: '#/components/schemas/Error' },
      },
    },
  }),
  validation(),
  response(),
  (req, res) => {
    const id = String(Object.keys(users).length + 1);
    const newUser = { id, ...req.body };
    users[id] = newUser;
    res.status(201).json(newUser);
  },
);

// GET /docs - OpenAPI documentation endpoint
app.get('/docs', documentation());

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/docs`);
  console.log(`\nTry these commands:`);
  console.log(`  curl http://localhost:${PORT}/users`);
  console.log(`  curl http://localhost:${PORT}/users/1`);
  console.log(`  curl -X POST http://localhost:${PORT}/users -H "Content-Type: application/json" -d '{"name":"Charlie","email":"charlie@example.com","age":35}'`);
});
