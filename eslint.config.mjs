import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import jestConfig from 'eslint-plugin-jest'
import spacing from '@stylistic/eslint-plugin'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  jestConfig.configs['flat/recommended'],
  spacing.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'jest/no-done-callback': 0,
    },
  },
)
