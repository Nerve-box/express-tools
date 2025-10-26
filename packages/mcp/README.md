# Express tools MCP compatibility

*Bring your Express API to the modern web*

- Express 5 compatible
- Model Context Protocol (MCP) support via JSON-RPC 2.0
- Expose your Express routes as AI-accessible tools
- Automatic tool registration and discovery

## Getting started

### Installation

```bash
npm i @express-tools/mcp
```

### Usage

Add the MCP router to your express app:

```javascript
import Express from 'express';
import { definition, router as MCPRouter } from '@express-tools/mcp';

// Wraps an existing Express app and adds MCP protocol support
const server = MCPRouter(express(), {
  serverInfo: {
    name: 'my-express-server',
    version: '1.0.0',
  },
  basePath: '/mcp', // Optional: defaults to '/mcp'
});
```

The MCP router automatically:
- Sets up a JSON-RPC 2.0 endpoint at the specified `basePath` (default: `/mcp`)
- Implements the MCP protocol methods: `initialize`, `tools/list`, `tools/call`
- Scans your routes for MCP tool definitions

## Defining MCP Tools

### Using the definition middleware

The definition middleware enables you to expose Express routes as MCP tools. The same route handler serves both standard HTTP requests and MCP tool calls:

```javascript
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

**How it works:**

- When called via **HTTP POST**, `req.body` contains the JSON payload
- When called via **MCP**, the tool arguments are automatically mapped to `req.body`
- The response from `res.json()` works for both HTTP and MCP calls
- This unified approach means you write one handler for both access methods

## MCP Protocol

The router automatically handles the MCP protocol methods:

- **`initialize`**: Returns server info and capabilities
- **`tools/list`**: Returns all registered tools
- **`tools/call`**: Executes a tool by name with provided arguments

All communication happens via JSON-RPC 2.0 over the configured endpoint.

### Example: Complete Server

Here's a complete example showing multiple tools:

```javascript
import express from 'express';
import { definition, router as MCPRouter } from '@express-tools/mcp';

const server = MCPRouter(express(), {
  serverInfo: {
    name: 'my-tools-server',
    version: '1.0.0',
  },
});

// Math calculator tool
server.post('/calculate', definition({
  name: 'calculate',
  description: 'Performs arithmetic calculations',
  inputSchema: {
    type: 'object',
    properties: {
      operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
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

// Greeting tool
server.post('/greet', definition({
  name: 'greet',
  description: 'Greets a person by name',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
    },
    required: ['name'],
  },
}), (req, res) => {
  const { name } = req.body;
  res.json(`Hello, ${name}!`);
});

server.listen(3000, () => {
  console.log('MCP server running on http://localhost:3000');
  console.log('MCP endpoint: http://localhost:3000/mcp');
});
```

## Contributing

Please do! This project is all about facilitating collaboration on complex projects and we intend to set the example ourselves.
If you want to contribute, feel free to ping @fed135.

## License

Apache-2.0 - 2025
