/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  env: {
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base/legacy',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:@next/next/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  root: true,
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-plusplus': 'off',
    'lines-between-class-members': 'off',
    'no-bitwise': 'off',
    'no-use-before-define': 'off',
  },
  ignorePatterns: ['old_cipher.js'],
};
