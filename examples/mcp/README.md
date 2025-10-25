# MCP Example - Simple Tools Server

This example demonstrates how to use the `@express-tools/mcp` package to add Model Context Protocol support to an Express application, making your API accessible to AI tools.

## Features

- MCP (Model Context Protocol) support via JSON-RPC 2.0
- Expose Express routes as AI-accessible tools
- Automatic tool registration and discovery
- Custom handlers for MCP-specific logic
- Dual access: HTTP and MCP protocol

## Installation

From the repository root:

```bash
npm install
cd examples/mcp
```

## Running the Example

```bash
node simple-tools.ts
```

## Usage

Once running, the server will be available at `http://localhost:3000` with the MCP endpoint at `/mcp`

### Initialize MCP Connection

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

Response includes server info and capabilities.

### List Available Tools

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

Returns all registered tools with their schemas.

### Call a Tool

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":3,
    "method":"tools/call",
    "params":{
      "name":"calculate",
      "arguments":{"operation":"add","a":5,"b":3}
    }
  }'
```

### Direct HTTP Access

Tools can also be accessed directly via HTTP:

```bash
curl -X POST http://localhost:3000/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"multiply","a":6,"b":7}'
```

## Available Tools

### 1. calculate
Performs basic arithmetic operations (add, subtract, multiply, divide)

```json
{
  "name": "calculate",
  "inputSchema": {
    "operation": "add|subtract|multiply|divide",
    "a": "number",
    "b": "number"
  }
}
```

### 2. transform_text
Transforms text using various string operations

```json
{
  "name": "transform_text",
  "inputSchema": {
    "text": "string",
    "operation": "uppercase|lowercase|reverse|length"
  }
}
```

### 3. get_weather
Gets mock weather information for a location

```json
{
  "name": "get_weather",
  "inputSchema": {
    "location": "string"
  }
}
```

## Key Concepts

### 1. Router Setup

```typescript
import { router as MCPRouter } from '@express-tools/mcp';

const app = MCPRouter(express(), {
  serverInfo: {
    name: 'my-server',
    version: '1.0.0'
  },
  basePath: '/mcp'  // JSON-RPC endpoint
});
```

### 2. Tool Definition

```typescript
app.post('/calculate',
  definition({
    name: 'calculate',
    description: 'Performs arithmetic operations',
    inputSchema: { /* JSON Schema */ },
    outputSchema: { /* JSON Schema */ }
  }),
  (req, res) => { /* HTTP handler */ }
);
```

### 3. Custom MCP Handler

```typescript
definition({
  name: 'my_tool',
  inputSchema: { /* ... */ },
  handler: async (args, req) => {
    // Custom logic for MCP invocations
    return result;
  }
})
```

The custom handler is called for MCP requests, while the route handler is used for direct HTTP requests.

## MCP Protocol

This implementation follows the [Model Context Protocol](https://modelcontextprotocol.io/) specification:

- **initialize**: Establishes connection and exchanges capabilities
- **tools/list**: Lists all available tools
- **tools/call**: Executes a specific tool with arguments

All communication uses JSON-RPC 2.0 format.

## Next Steps

- Connect to an AI client that supports MCP
- Add more complex tools with file system access
- Implement tool chaining and workflows
- Add authentication to the MCP endpoint
- Integrate with LangChain or other AI frameworks
