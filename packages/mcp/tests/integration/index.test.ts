import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { router, definition } from '../../src/index.ts';

describe('MCP Integration Tests', () => {
  let server;
  let app;
  let port;

  beforeEach(() => {
    port = 10000 + Math.round(Math.random() * 10000);
    server = router(express(), {
      serverInfo: {
        name: 'test-mcp-server',
        version: '1.0.0',
        description: 'Integration test server',
      },
      basePath: '/mcp',
    });
  });

  afterEach(() => {
    if (app) app.close();
    server = null;
    app = null;
  });

  describe('initialize', () => {
    beforeEach(async () => {
      await new Promise<void>((resolve, reject) => {
        app = server.listen(port, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    test('should return protocol version and server info', async () => {
      const req = await fetch(`http://localhost:${port}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {},
        }),
      });

      const data = await req?.json();

      assert.strictEqual(req.status, 200);
      assert.deepStrictEqual(data, {
        jsonrpc: '2.0',
        id: 1,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {
              listChanged: false,
            },
          },
          serverInfo: {
            name: 'test-mcp-server',
            version: '1.0.0',
            description: 'Integration test server',
          },
        },
      });
    });
  });

  describe('tools/list', () => {
    beforeEach(async () => {
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
        outputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            result: { type: 'number' },
          },
        },
      }), (req, res) => {
        res.json({ httpEndpoint: true });
      });

      server.post('/greet', definition({
        name: 'greet',
        description: 'Greets a person',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
        },
      }), (req, res) => {
        res.json({ greeting: 'Hello!' });
      });

      await new Promise<void>((resolve, reject) => {
        app = server.listen(port, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    test('should return all registered tools', async () => {
      const req = await fetch(`http://localhost:${port}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list',
          params: {},
        }),
      });

      const data = await req?.json();

      assert.strictEqual(req.status, 200);
      assert.strictEqual(data.jsonrpc, '2.0');
      assert.strictEqual(data.id, 2);
      assert.ok(data.result !== undefined);
      assert.ok(data.result.tools instanceof Array);
      assert.strictEqual(data.result.tools.length, 2);

      const toolNames = data.result.tools.map(t => t.name);
      assert.ok(toolNames.includes('calculate'));
      assert.ok(toolNames.includes('greet'));

      const calculateTool = data.result.tools.find(t => t.name === 'calculate');
      assert.ok(calculateTool !== undefined);
      assert.strictEqual(calculateTool.description, 'Performs arithmetic calculations');
      assert.ok(calculateTool.inputSchema !== undefined);
      assert.ok(calculateTool.outputSchema !== undefined);
    });
  });

  describe('tools/call', () => {
    beforeEach(async () => {
      server.post('/calculate', definition({
        name: 'calculate',
        description: 'Performs arithmetic calculations',
        inputSchema: {
          type: 'object',
          properties: {
            body: {
              type: 'object',
              properties: {
                operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
                a: { type: 'number' },
                b: { type: 'number' },
              },
            },
          },
          required: ['operation', 'a', 'b'],
        },
      }), (req, res) => {
        const { operation, a, b } = req.body;
        let result;
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
            result = a / b;
            break;
          default:
            throw new Error('Invalid operation');
        }

        res.json(result);
      });

      await new Promise<void>((resolve, reject) => {
        app = server.listen(port, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    test('should execute tool via MCP', async () => {
      const req = await fetch(`http://localhost:${port}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'calculate',
            arguments: {
              body: {
                operation: 'add',
                a: 5,
                b: 3,
              },
            },
          },
        }),
      });

      const data = await req?.json();

      assert.strictEqual(req.status, 200);
      assert.strictEqual(data.jsonrpc, '2.0');
      assert.strictEqual(data.id, 3);
      assert.ok(data.result !== undefined);
      assert.ok(data.result.content instanceof Array);
      assert.strictEqual(data.result.content.length, 1);
      assert.strictEqual(data.result.content[0].type, 'text');
      assert.strictEqual(data.result.content[0].text, 8);
    });

    test('should execute tool with different operations', async () => {
      const testCases = [
        { operation: 'subtract', a: 10, b: 4, expected: 6 },
        { operation: 'multiply', a: 7, b: 6, expected: 42 },
        { operation: 'divide', a: 20, b: 5, expected: 4 },
      ];

      for (const testCase of testCases) {
        const req = await fetch(`http://localhost:${port}/mcp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 4,
            method: 'tools/call',
            params: {
              name: 'calculate',
              arguments: { body: testCase },
            },
          }),
        });

        const data = await req?.json();
        assert.strictEqual(data.result.content[0].text, testCase.expected);
      }
    });

    test('should allow HTTP access to the same route', async () => {
      const req = await fetch(`http://localhost:${port}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'add',
          a: 10,
          b: 5,
        }),
      });

      const data = await req?.json();

      assert.strictEqual(req.status, 200);
      assert.strictEqual(data, 15);
    });
  });

  describe('non-MCP routes', () => {
    beforeEach(async () => {
      server.get('/health', (req, res) => {
        res.json({ status: 'healthy' });
      });

      await new Promise<void>((resolve, reject) => {
        app = server.listen(port, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    test('should still work as regular Express routes', async () => {
      const req = await fetch(`http://localhost:${port}/health`, {
        method: 'GET',
      });

      const data = await req?.json();

      assert.strictEqual(req.status, 200);
      assert.deepStrictEqual(data, { status: 'healthy' });
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await new Promise<void>((resolve, reject) => {
        app = server.listen(port, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    test('should handle invalid JSON-RPC requests', async () => {
      const req = await fetch(`http://localhost:${port}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing required jsonrpc field
          id: 999,
          method: 'initialize',
        }),
      });

      const data = await req?.json();

      assert.strictEqual(req.status, 200);
      assert.ok(data.error !== undefined);
    });

    test('should return 204 for JSON-RPC notifications', async () => {
      const {
        status,
      } = await fetch(`http://localhost:${port}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          // No id field = notification
          method: 'initialize',
          params: {},
        }),
      });

      assert.strictEqual(status, 204);
    });
  });

  describe('custom basePath', () => {
    beforeEach(async () => {
      await new Promise<void>((resolve, reject) => {
        app = server.listen(port, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    test('should be accessible at the configured basePath', async () => {
      const req = await fetch(`http://localhost:${port}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 100,
          method: 'initialize',
          params: {},
        }),
      });

      const data = await req?.json();

      assert.strictEqual(req.status, 200);
      assert.ok(data.result !== undefined);
    });
  });
});
