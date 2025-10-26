import { describe, test, expect, jest } from '@jest/globals';
import definition from './definition';
import type { Request, Response } from 'express';

describe('definition', () => {
  describe('validation', () => {
    test('should throw error when definition is not an object', () => {
      expect(() => definition(null as any)).toThrow('Tool definition must be an object');
      expect(() => definition(undefined as any)).toThrow('Tool definition must be an object');
      expect(() => definition('string' as any)).toThrow('Tool definition must be an object');
      expect(() => definition(123 as any)).toThrow('Tool definition must be an object');
    });

    test('should throw error when name is missing', () => {
      expect(() => definition({ inputSchema: {} } as any)).toThrow('MCP tool definition is missing property "name"');
    });

    test('should throw error when name is not a string', () => {
      expect(() => definition({ name: 123, inputSchema: {} } as any)).toThrow('MCP tool definition is missing property "name"');
      expect(() => definition({ name: {}, inputSchema: {} } as any)).toThrow('MCP tool definition is missing property "name"');
    });

    test('should throw error when inputSchema is missing', () => {
      expect(() => definition({ name: 'test' } as any)).toThrow('MCP tool definition is missing property "inputSchema"');
    });

    test('should throw error when inputSchema is not an object', () => {
      expect(() => definition({ name: 'test', inputSchema: 'not-object' } as any))
        .toThrow('MCP tool definition is missing property "inputSchema"');
      expect(() => definition({ name: 'test', inputSchema: 123 } as any))
        .toThrow('MCP tool definition is missing property "inputSchema"');
    });

    test('should throw error when outputSchema is provided but not an object', () => {
      expect(() => definition({
        name: 'test',
        inputSchema: {},
        outputSchema: 'not-object',
      } as any)).toThrow('MCP tool definition "outputSchema" must be an object if provided');

      expect(() => definition({
        name: 'test',
        inputSchema: {},
        outputSchema: 123,
      } as any)).toThrow('MCP tool definition "outputSchema" must be an object if provided');
    });

    test('should throw error when handler is provided but not a function', () => {
      expect(() => definition({
        name: 'test',
        inputSchema: {},
        handler: 'not-function',
      } as any)).toThrow('MCP tool definition "handler" must be a function if provided');

      expect(() => definition({
        name: 'test',
        inputSchema: {},
        handler: 123,
      } as any)).toThrow('MCP tool definition "handler" must be a function if provided');
    });

    test('should accept valid definition with only required fields', () => {
      expect(() => definition({
        name: 'test',
        inputSchema: { type: 'object' },
      })).not.toThrow();
    });

    test('should accept valid definition with all fields', () => {
      expect(() => definition({
        name: 'test',
        description: 'Test tool',
        inputSchema: { type: 'object', properties: { arg: { type: 'string' } } },
        outputSchema: { type: 'object', properties: { result: { type: 'string' } } },
        handler: args => args,
      })).not.toThrow();
    });
  });

  describe('middleware behavior', () => {
    const validDefinition = {
      name: 'test-tool',
      inputSchema: { type: 'object' as const },
    };

    test('should return a function', () => {
      const middleware = definition(validDefinition);
      expect(typeof middleware).toBe('function');
    });

    test('should have MCPType property set to "definition"', () => {
      const middleware = definition(validDefinition);
      expect(middleware.MCPType).toBe('definition');
    });

    test('should return tool definition when called without request', () => {
      const toolDef = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: { type: 'object' as const },
      };
      const middleware = definition(toolDef);
      const result = middleware();

      expect(result).toEqual(toolDef);
    });

    test('should call next() when used as middleware', () => {
      const middleware = definition(validDefinition);

      const mockReq = {} as Request;
      const mockRes = {} as Response;
      const mockNext = jest.fn();

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
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

      expect(result.outputSchema).toEqual(toolDef.outputSchema);
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

      expect(result.handler).toBe(handler);
    });

    test('should preserve description in returned definition', () => {
      const toolDef = {
        name: 'test',
        description: 'A helpful test tool',
        inputSchema: { type: 'object' as const },
      };
      const middleware = definition(toolDef);
      const result = middleware();

      expect(result.description).toBe('A helpful test tool');
    });
  });
});
