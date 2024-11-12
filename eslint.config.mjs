import { fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['src/lib/weechat/parser.js', '.expo/**/*']
  },
  eslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  eslintConfigPrettier,
  {
    plugins: {
      'react-hooks': fixupPluginRules(hooksPlugin)
    },
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node
      },
      parser: tseslint.parser,
      parserOptions: {
        project: true
      }
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...hooksPlugin.configs.recommended.rules,

      eqeqeq: 'error',
      'no-param-reassign': ['error', { props: true }],

      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true }
      ],

      'react/no-access-state-in-setstate': 'error',
      'react/prop-types': 'off'
    }
  }
);
