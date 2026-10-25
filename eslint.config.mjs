import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['node_modules/**', '.vercel/**']
  },
  js.configs.recommended,
  {
    files: ['api/**/*.js', 'eslint.config.mjs'],
    languageOptions: {
      globals: globals.node
    },
    rules: {
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error'
    }
  },
  {
    files: ['public/js/**/*.js'],
    languageOptions: {
      globals: globals.browser
    },
    rules: {
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'error'
    }
  }
];
