import { describe, test, mock } from 'node:test';
import assert from 'node:assert/strict';
import definition from './definition.ts';
import type { Request, Response } from 'express';

describe('definition', () => {
  describe('validation', () => {
    test('should throw error when definition is not an object', () => {
      assert.throws(() => definition(null as any), { message: 'Tool definition must be an object' });
      assert.throws(() => definition(undefined as any), { message: 'Tool definition must be an object' });
      assert.throws(() => definition('string' as any), { message: 'Tool definition must be an object' });
      assert.throws(() => definition(123 as any), { message: 'Tool definition must be an object' });
    });

    test('should throw error when name is missing', () => {
      assert.throws(() => definition({ inputSchema: {} } as any), { message: 'MCP tool definition is missing property "name" (must be a string)' });
    });

    test('should throw error when name is not a string', () => {
      assert.throws(() => definition({ name: 123, inputSchema: {} } as any), { message: 'MCP tool definition is missing property "name" (must be a string)' });
      assert.throws(() => definition({ name: {}, inputSchema: {} } as any), { message: 'MCP tool definition is missing property "name" (must be a string)' });
    });

    test('should throw error when inputSchema is missing', () => {
      assert.throws(() => definition({ name: 'test' } as any), { message: 'MCP tool definition is missing property "inputSchema" (must be an object)' });
    });

    test('should throw error when inputSchema is not an object', () => {
      assert.throws(() => definition({ name: 'test', inputSchema: 'not-object' } as any), { message: 'MCP tool definition is missing property "inputSchema" (must be an object)' });
      assert.throws(() => definition({ name: 'test', inputSchema: 123 } as any), { message: 'MCP tool definition is missing property "inputSchema" (must be an object)' });
    });

    test('should throw error when outputSchema is provided but not an object', () => {
      assert.throws(() => definition({ name: 'test', inputSchema: {}, outputSchema: 'not-object' } as any), { message: 'MCP tool definition "outputSchema" must be an object if provided' });
      assert.throws(() => definition({ name: 'test', inputSchema: {}, outputSchema: 123 } as any), { message: 'MCP tool definition "outputSchema" must be an object if provided' });
    });

    test('should throw error when handler is provided but not a function', () => {
      assert.throws(() => definition({ name: 'test', inputSchema: {}, handler: 'not-function' } as any), { message: 'MCP tool definition "handler" must be a function if provided' });
      assert.throws(() => definition({ name: 'test', inputSchema: {}, handler: 123 } as any), { message: 'MCP tool definition "handler" must be a function if provided' });
    });

    test('should accept valid definition with only required fields', () => {
      assert.doesNotThrow(() => definition({
        name: 'test',
        inputSchema: { type: 'object' },
      }));
    });

    test('should accept valid definition with all fields', () => {
      assert.doesNotThrow(() => definition({
        name: 'test',
        description: 'Test tool',
        inputSchema: { type: 'object', properties: { arg: { type: 'string' } } },
        outputSchema: { type: 'object', properties: { result: { type: 'string' } } },
        handler: args => args,
      }));
    });
  });

  describe('middleware behavior', () => {
    const validDefinition = {
      name: 'test-tool',
      inputSchema: { type: 'object' as const },
    };

    test('should return a function', () => {
      const middleware = definition(validDefinition);
      assert.strictEqual(typeof middleware, 'function');
    });

    test('should have MCPType property set to "definition"', () => {
      const middleware = definition(validDefinition);
      assert.strictEqual(middleware.MCPType, 'definition');
    });

    test('should return tool definition when called without request', () => {
      const toolDef = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: { type: 'object' as const },
      };
      const middleware = definition(toolDef);
      const result = middleware();

      assert.deepStrictEqual(result, toolDef);
    });

    test('should call next() when used as middleware', () => {
      const middleware = definition(validDefinition);

      const mockReq = {} as Request;
      const mockRes = {} as Response;
      const mockNext = mock.fn();

      middleware(mockReq, mockRes, mockNext);

      assert.strictEqual(mockNext.mock.calls.length, 1);
    });
  });

  describe('integration with optional fields', () => {
    test('should preserve outputSchema in returned definition', () => {
      const toolDef = {
        name: 'test',
        inputSchema: { type: 'object' as const },
        outputSchema: { type: 'object' as const, properties: { result: { type: 'number' as const } } },
      };
      const middleware = definition(toolDef);
      const result = middleware();

      assert.deepStrictEqual(result.outputSchema, toolDef.outputSchema);
    });

    test('should preserve handler in returned definition', () => {
      const handler = (args: any) => ({ result: args.value * 2 });
      const toolDef = {
        name: 'test',
        inputSchema: { type: 'object' as const },
        handler,
      };
      const middleware = definition(toolDef);
      const result = middleware();

      assert.strictEqual(result.handler, handler);
    });

    test('should preserve description in returned definition', () => {
      const toolDef = {
        name: 'test',
        description: 'A helpful test tool',
        inputSchema: { type: 'object' as const },
      };
      const middleware = definition(toolDef);
      const result = middleware();

      assert.strictEqual(result.description, 'A helpful test tool');
    });
  });
});
