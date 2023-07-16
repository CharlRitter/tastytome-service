module.exports = {
  env: {
    node: true,
    es2021: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint'],
  settings: {
    'import/resolver': {
      typescript: {}
    }
  },
  rules: {
    // TypeScript
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

    // Node.js and CommonJS
    'class-methods-use-this': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never'
      }
    ]
  }
};
