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
  tools: [], // Optional: predefined tools
  handlers: {}, // Optional: predefined handlers
});
```

The MCP router automatically:
- Sets up a JSON-RPC 2.0 endpoint at the specified `basePath` (default: `/mcp`)
- Implements the MCP protocol methods: `initialize`, `tools/list`, `tools/call`
- Scans your routes for MCP tool definitions

## Defining MCP Tools

### Option 1: Using the definition middleware

The definition middleware enables you to expose Express routes as MCP tools:

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
  outputSchema: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      result: { type: 'number' },
    },
  },
}), (req, res, next) => {
  const { operation, a, b } = req.body;
  let result;

  switch (operation) {
    case 'add': result = a + b; break;
    case 'subtract': result = a - b; break;
    case 'multiply': result = a * b; break;
    case 'divide': result = a / b; break;
  }

  res.json(result);
  return next();
});
```

### Option 2: Providing tools upfront

You can also define tools and handlers when initializing the router:

```javascript
const server = MCPRouter(express(), {
  serverInfo: {
    name: 'my-server',
    version: '1.0.0',
  },
  tools: [
    {
      name: 'get_weather',
      description: 'Gets current weather for a location',
      inputSchema: {
        type: 'object',
        properties: {
          location: { type: 'string' },
        },
        required: ['location'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          temperature: { type: 'number' },
          conditions: { type: 'string' },
        },
      },
    },
  ],
  handlers: {
    get_weather: async (args, req) => {
      // Your handler logic
      const { location } = args;
      return {
        temperature: 72,
        conditions: 'Sunny',
      };
    },
  },
});
```

## MCP Protocol

The router automatically handles the MCP protocol methods:

- **`initialize`**: Returns server info and capabilities
- **`tools/list`**: Returns all registered tools
- **`tools/call`**: Executes a tool by name with provided arguments

All communication happens via JSON-RPC 2.0 over the configured endpoint.

## Custom Handler

You can provide a custom handler in the definition that will be called instead of the route handler:

```javascript
server.post('/search', definition({
  name: 'search',
  description: 'Search through documents',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string' },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      results: { type: 'array' },
    },
  },
  handler: async (args, req) => {
    // Custom logic that bypasses the route handler
    const results = await searchDocuments(args.query);
    return results;
  },
}), (req, res, next) => {
  // This won't be called when invoked via MCP
  res.json({ message: 'Use MCP to access this tool' });
  return next();
});
```

## Contributing

Please do! This project is all about facilitating collaboration on complex projects and we intend to set the example ourselves.
If you want to contribute, feel free to ping @fed135.

## License

Apache-2.0 - 2025
