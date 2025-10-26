import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import jestConfig from 'eslint-plugin-jest';
import spacing from '@stylistic/eslint-plugin';

export default tseslint.config(
  {
    ignores: ['**/bin/**', '**/node_modules/**'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  jestConfig.configs['flat/recommended'],
  spacing.configs.recommended,
  {
    rules: {
      '@stylistic/semi': [2, 'always'],
      '@typescript-eslint/no-explicit-any': 0,
      'jest/no-done-callback': 0,
    },
  },
);
