import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { deferred } from './utils.ts';

describe('deferred util', () => {
  test('deferred should return and object with references to promise, resolve and reject', () => {
    const foo = deferred();
    assert.ok(foo instanceof Object);
    assert.ok(foo.promise instanceof Promise);
    assert.ok(foo.resolve instanceof Function);
    assert.ok(foo.reject instanceof Function);
  });

  test('deferred promise should resolve once internal resolve is called', async () => {
    const foo = deferred();
    foo.resolve('a');
    assert.strictEqual(await foo.promise, 'a');
  });

  test('deferred promise should reject once internal reject is called', async () => {
    const foo = deferred();
    foo.reject('b');
    let caught;
    try {
      await foo.promise;
    }
    catch (e) {
      caught = e;
    }
    assert.strictEqual(caught, 'b');
  });
});
