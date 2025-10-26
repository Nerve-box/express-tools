import express from 'express';
import { request } from 'undici';
import { router, definition } from '../../src/index';

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
    beforeEach((done) => {
      app = server.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should return protocol version and server info', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {},
        }),
      });

      const data = await body.json();

      expect(statusCode).toEqual(200);
      expect(data).toEqual({
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
    beforeEach((done) => {
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

      app = server.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should return all registered tools', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list',
          params: {},
        }),
      });

      const data = await body.json();

      expect(statusCode).toEqual(200);
      expect(data.jsonrpc).toEqual('2.0');
      expect(data.id).toEqual(2);
      expect(data.result).toBeDefined();
      expect(data.result.tools).toBeInstanceOf(Array);
      expect(data.result.tools.length).toEqual(2);

      const toolNames = data.result.tools.map(t => t.name);
      expect(toolNames).toContain('calculate');
      expect(toolNames).toContain('greet');

      const calculateTool = data.result.tools.find(t => t.name === 'calculate');
      expect(calculateTool).toBeDefined();
      expect(calculateTool.description).toEqual('Performs arithmetic calculations');
      expect(calculateTool.inputSchema).toBeDefined();
      expect(calculateTool.outputSchema).toBeDefined();
    });
  });

  describe('tools/call', () => {
    beforeEach((done) => {
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

      app = server.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should execute tool via MCP', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/mcp`, {
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

      const data = await body.json();

      expect(statusCode).toEqual(200);
      expect(data.jsonrpc).toEqual('2.0');
      expect(data.id).toEqual(3);
      expect(data.result).toBeDefined();
      expect(data.result.content).toBeInstanceOf(Array);
      expect(data.result.content.length).toEqual(1);
      expect(data.result.content[0].type).toEqual('text');
      expect(data.result.content[0].text).toEqual(8);
    });

    test('should execute tool with different operations', async () => {
      const testCases = [
        { operation: 'subtract', a: 10, b: 4, expected: 6 },
        { operation: 'multiply', a: 7, b: 6, expected: 42 },
        { operation: 'divide', a: 20, b: 5, expected: 4 },
      ];

      for (const testCase of testCases) {
        const {
          body,
        } = await request(`http://localhost:${port}/mcp`, {
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

        const data = await body.json();
        expect(data.result.content[0].text).toEqual(testCase.expected);
      }
    });

    test('should allow HTTP access to the same route', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'add',
          a: 10,
          b: 5,
        }),
      });

      const data = await body.json();

      expect(statusCode).toEqual(200);
      expect(data).toEqual(15);
    });
  });

  describe('non-MCP routes', () => {
    beforeEach((done) => {
      server.get('/health', (req, res) => {
        res.json({ status: 'healthy' });
      });

      app = server.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should still work as regular Express routes', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/health`, {
        method: 'GET',
      });

      const data = await body.json();

      expect(statusCode).toEqual(200);
      expect(data).toEqual({ status: 'healthy' });
    });
  });

  describe('error handling', () => {
    beforeEach((done) => {
      app = server.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should handle invalid JSON-RPC requests', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Missing required jsonrpc field
          id: 999,
          method: 'initialize',
        }),
      });

      const data = await body.json();

      expect(statusCode).toEqual(200);
      expect(data.error).toBeDefined();
    });

    test('should return 204 for JSON-RPC notifications', async () => {
      const {
        statusCode,
      } = await request(`http://localhost:${port}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          // No id field = notification
          method: 'initialize',
          params: {},
        }),
      });

      expect(statusCode).toEqual(204);
    });
  });

  describe('custom basePath', () => {
    beforeEach((done) => {
      app = server.listen(port, (err) => {
        if (err) throw err;
        done();
      });
    });

    test('should be accessible at the configured basePath', async () => {
      const {
        statusCode,
        body,
      } = await request(`http://localhost:${port}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 100,
          method: 'initialize',
          params: {},
        }),
      });

      const data = await body.json();

      expect(statusCode).toEqual(200);
      expect(data.result).toBeDefined();
    });
  });
});
