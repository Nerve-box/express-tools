import { deferred } from './utils';

describe('deferred util', () => {
  test('deferred should return and object with references to promise, resolve and reject', () => {
    const foo = deferred();
    expect(foo).toBeInstanceOf(Object);
    expect(foo.promise).toBeInstanceOf(Promise);
    expect(foo.resolve).toBeInstanceOf(Function);
    expect(foo.reject).toBeInstanceOf(Function);
  });

  test('deferred promise should resolve once internal resolve is called', () => {
    expect.assertions(1);
    const foo = deferred();
    foo.resolve('a');
    return expect(foo.promise).resolves.toEqual('a');
  });

  test('deferred promise should reject once internal reject is called', () => {
    expect.assertions(1);
    const foo = deferred();
    foo.reject('b');
    return expect(foo.promise).rejects.toEqual('b');
  });
});
