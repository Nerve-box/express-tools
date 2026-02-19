import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPathToOAS, formatPathFromOAS } from './utils.ts';

describe('Utils', () => {
  describe('formatPathToOAS', () => {
    test('should convert a valid express-type path to OAS format', () => {
      assert.strictEqual(formatPathToOAS('/foo/:id'), '/foo/{id}');
    });
  });

  describe('formatPathFromOAS', () => {
    test('should convert a valid oas-type path to express format', () => {
      assert.strictEqual(formatPathFromOAS('/foo/{id}'), '/foo/:id');
    });
  });
});
