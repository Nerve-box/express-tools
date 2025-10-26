# MCP Example - Simple Tools Server

This example demonstrates how to use the `@express-tools/mcp` package to add Model Context Protocol support to an Express application, making your API accessible to AI tools.

## Features

- MCP (Model Context Protocol) support via JSON-RPC 2.0
- Expose Express routes as AI-accessible tools
- Automatic tool registration and discovery
- Unified handlers that work for both HTTP and MCP
- Dual access: Same handler serves HTTP and MCP protocol

## Installation

From the repository root:

```bash
npm install
cd examples/mcp
```

## Running the Example

```bash
npm start
```

Or directly:

```bash
tsx index.ts
```

## Usage

Once running, the server will be available at `http://localhost:9001` with the MCP endpoint at `/mcp`

### Initialize MCP Connection

```bash
curl -X POST http://localhost:9001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

Response includes server info and capabilities.

### List Available Tools

```bash
curl -X POST http://localhost:9001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

Returns all registered tools with their schemas.

### Call a Tool

```bash
curl -X POST http://localhost:9001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":3,
    "method":"tools/call",
    "params":{
      "name":"pi_calc",
      "arguments":{"decimals":10}
    }
  }'
```

### Direct HTTP Access

Tools can also be accessed directly via HTTP:

```bash
curl http://localhost:9001/pi/calculate?decimals=50
```

## Available Tools

### pi_calc
Computes the irrational number PI up to a given amount of digits using Machin's formula.

**Input Schema:**
```json
{
  "decimals": {
    "type": "number",
    "description": "The amount of decimals to compute",
    "minimum": 3,
    "maximum": 1000,
    "default": 10
  }
}
```

**Example:**
```bash
# Via MCP
curl -X POST http://localhost:9001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"tools/call",
    "params":{"name":"pi_calc","arguments":{"decimals":20}}
  }'

# Via HTTP
curl http://localhost:9001/pi/calculate?decimals=20
```

## Key Concepts

### 1. Router Setup

```typescript
import { router as MCPRouter } from '@express-tools/mcp';

const server = MCPRouter(express(), {
  serverInfo: {
    name: 'math_formulas',
    version: '1.0.0'
  },
  basePath: '/mcp'  // JSON-RPC endpoint (default: '/mcp')
});
```

### 2. Tool Definition

Define MCP tools using the `definition` middleware. The same route handler serves both HTTP and MCP requests:

```typescript
server.get('/pi/calculate',
  definition({
    name: 'pi_calc',
    description: 'Computes PI to N decimals',
    inputSchema: {
      type: 'object',
      properties: {
        decimals: { type: 'number', minimum: 3, maximum: 1000 }
      },
      required: ['decimals']
    }
  }),
  (req, res) => {
    // Handler works for both HTTP and MCP calls
    // MCP arguments are automatically mapped to req.params/req.body
    const result = calculatePi(req.params.decimals);
    res.json(result);
  }
);
```

### 3. Unified Handler Design

**Key Feature:** One handler for both access methods

- **HTTP requests**: `req.params` and `req.body` work as normal
- **MCP calls**: Tool arguments are automatically mapped to `req.body`
- **Response**: `res.json()` works transparently for both protocols

This means you don't need separate logic for HTTP vs MCP - write your handler once!

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
