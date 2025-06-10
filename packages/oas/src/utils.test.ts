import { formatPathToOAS, formatPathFromOAS } from './utils';

describe('Utils', () => {
  describe('formatPathToOAS', () => {
    test('should convert a valid express-type path to OAS format', () => {
      expect(formatPathToOAS('/foo/:id')).toEqual('/foo/{id}');
    });
  });

  describe('formatPathFromOAS', () => {
    test('should convert a valid oas-type path to express format', () => {
      expect(formatPathFromOAS('/foo/{id}')).toEqual('/foo/:id');
    });
  });
});
