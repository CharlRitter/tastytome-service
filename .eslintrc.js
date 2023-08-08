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
    ],

    // Stylistic
    'array-bracket-spacing': ['warn', 'never'],
    'block-spacing': ['warn', 'always'],
    'brace-style': ['warn', '1tbs', { allowSingleLine: false }],
    'comma-spacing': ['warn', { before: false, after: true }],
    'comma-style': ['warn', 'last'],
    'computed-property-spacing': ['warn', 'never'],
    'consistent-this': ['warn', 'self'],
    'eol-last': 'warn',
    'func-names': 'warn',
    'func-style': ['warn', 'declaration'],
    'id-length': ['warn', { min: 2, max: 32 }],
    indent: 'off',
    '@typescript-eslint/indent': ['warn', 2],
    'jsx-quotes': ['warn', 'prefer-double'],
    'linebreak-style': ['warn', 'unix'],
    'lines-around-comment': ['warn', { beforeBlockComment: true }],
    'max-depth': ['warn', 8],
    'max-len': ['warn', 120],
    'max-nested-callbacks': ['warn', 8],
    'max-params': ['warn', 8],
    'max-statements-per-line': ['warn', { max: 2 }],
    'new-cap': 'warn',
    'new-parens': 'warn',
    'newline-after-var': 'warn',
    'newline-before-return': 'warn',
    'newline-per-chained-call': ['warn', { ignoreChainWithDepth: 3 }],
    'no-array-constructor': 'warn',
    'no-bitwise': 'warn',
    'no-continue': 'warn',
    'no-inline-comments': 'off',
    'no-lonely-if': 'warn',
    'no-mixed-operators': 'warn',
    'no-multiple-empty-lines': 'warn',
    'no-negated-condition': 'warn',
    'no-nested-ternary': 'warn',
    'no-new-object': 'warn',
    'no-plusplus': 'off',
    'no-spaced-func': 'warn',
    'no-ternary': 'off',
    'no-trailing-spaces': 'warn',
    'no-underscore-dangle': 'off',
    'no-unneeded-ternary': 'warn',
    'no-whitespace-before-property': 'warn',
    'object-curly-spacing': ['warn', 'always'],
    'object-curly-newline': ['warn', { multiline: true }],
    'one-var': ['warn', 'never'],
    'operator-assignment': ['warn', 'always'],
    'padded-blocks': ['warn', 'never'],
    'quote-props': ['warn', 'as-needed'],
    quotes: ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'semi-spacing': ['warn', { before: false, after: true }],
    semi: ['warn', 'always'],
    'space-before-blocks': 'warn',
    'space-before-function-paren': ['warn', 'never'],
    'space-in-parens': ['warn', 'never'],
    'space-infix-ops': 'warn',
    'space-unary-ops': ['warn', { words: true, nonwords: false }],
    'spaced-comment': ['warn', 'always', { exceptions: ['-'] }],
    'comma-dangle': 'off',
    '@typescript-eslint/comma-dangle': 'off'
  }
};
