/**
 * Simple Express API with MCP (Model Context Protocol) plugin
 *
 * This example demonstrates:
 * - Setting up an MCP-enhanced Express server
 * - Exposing Express routes as AI-accessible tools
 * - JSON-RPC 2.0 endpoint for MCP communication
 * - Both HTTP and MCP access patterns
 *
 * Run with: node --experimental-strip-types simple-tools.ts
 *
 * The MCP endpoint will be available at: http://localhost:3000/mcp
 */

import express from 'express';
import { definition, router as MCPRouter } from '@express-tools/mcp';

// Initialize MCP-enhanced Express app
const app = MCPRouter(express(), {
  serverInfo: {
    name: 'simple-tools-server',
    version: '1.0.0',
    description: 'A simple example showing MCP tools',
  },
  basePath: '/mcp', // JSON-RPC endpoint
});

// Simple calculator tool
app.post('/calculate',
  definition({
    name: 'calculate',
    description: 'Performs basic arithmetic operations (add, subtract, multiply, divide)',
    inputSchema: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['add', 'subtract', 'multiply', 'divide'],
          description: 'The arithmetic operation to perform',
        },
        a: {
          type: 'number',
          description: 'First operand',
        },
        b: {
          type: 'number',
          description: 'Second operand',
        },
      },
      required: ['operation', 'a', 'b'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        result: { type: 'number' },
        operation: { type: 'string' },
      },
    },
  }),
  (req, res) => {
    const { operation, a, b } = req.body;
    let result: number;

    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          return res.status(400).json({ error: 'Division by zero' });
        }
        result = a / b;
        break;
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }

    res.json({ result, operation });
  },
);

// String manipulation tool
app.post('/transform-text',
  definition({
    name: 'transform_text',
    description: 'Transforms text using various string operations',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to transform',
        },
        operation: {
          type: 'string',
          enum: ['uppercase', 'lowercase', 'reverse', 'length'],
          description: 'The transformation to apply',
        },
      },
      required: ['text', 'operation'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        result: { type: 'string' },
      },
    },
  }),
  (req, res) => {
    const { text, operation } = req.body;
    let result: string | number;

    switch (operation) {
      case 'uppercase':
        result = text.toUpperCase();
        break;
      case 'lowercase':
        result = text.toLowerCase();
        break;
      case 'reverse':
        result = text.split('').reverse().join('');
        break;
      case 'length':
        result = text.length;
        break;
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }

    res.json({ result: String(result) });
  },
);

// Weather tool with custom handler (demonstrates MCP-specific logic)
app.post('/weather',
  definition({
    name: 'get_weather',
    description: 'Gets current weather information for a location (mock data)',
    inputSchema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name or location',
        },
      },
      required: ['location'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        temperature: { type: 'number' },
        conditions: { type: 'string' },
        location: { type: 'string' },
      },
    },
    // Custom handler for MCP calls (bypasses HTTP route handler)
    handler: async (args) => {
      // Simulate weather lookup
      const weatherData: Record<string, { temp: number, conditions: string }> = {
        'new york': { temp: 72, conditions: 'Partly Cloudy' },
        'london': { temp: 58, conditions: 'Rainy' },
        'tokyo': { temp: 68, conditions: 'Sunny' },
      };

      const key = args.location.toLowerCase();
      const weather = weatherData[key] || { temp: 70, conditions: 'Unknown' };

      return {
        temperature: weather.temp,
        conditions: weather.conditions,
        location: args.location,
      };
    },
  }),
  (req, res) => {
    // This handler is used for direct HTTP requests
    res.json({
      message: 'This endpoint is primarily accessed via MCP. Use the /mcp JSON-RPC endpoint.',
      hint: 'Try making a POST request to /mcp with method "tools/call"',
    });
  },
);

// Health check endpoint (regular HTTP, not an MCP tool)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`MCP JSON-RPC endpoint: http://localhost:${PORT}/mcp`);
  console.log(`\nAvailable MCP Tools:`);
  console.log(`  - calculate: Basic arithmetic operations`);
  console.log(`  - transform_text: String transformations`);
  console.log(`  - get_weather: Mock weather data`);
  console.log(`\nTest MCP Protocol:`);
  console.log(`\n1. Initialize:`);
  console.log(`   curl -X POST http://localhost:${PORT}/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'`);
  console.log(`\n2. List tools:`);
  console.log(`   curl -X POST http://localhost:${PORT}/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'`);
  console.log(`\n3. Call a tool:`);
  console.log(`   curl -X POST http://localhost:${PORT}/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"calculate","arguments":{"operation":"add","a":5,"b":3}}}'`);
  console.log(`\nOr test via HTTP directly:`);
  console.log(`   curl -X POST http://localhost:${PORT}/calculate -H "Content-Type: application/json" -d '{"operation":"multiply","a":6,"b":7}'`);
});
