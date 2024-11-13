import { fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginJest from 'eslint-plugin-jest';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['src/lib/weechat/parser.js', '.expo/**/*']
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  eslintConfigPrettier,
  {
    plugins: {
      'react-hooks': fixupPluginRules(hooksPlugin)
    },
    languageOptions: {
      globals: {
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
      '@typescript-eslint/no-deprecated': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false
          }
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true }
      ],
      '@typescript-eslint/strict-boolean-expressions': [
        'warn',
        {
          allowNullableString: true
        }
      ],

      'react/no-access-state-in-setstate': 'error',
      'react/prop-types': 'off'
    }
  },
  {
    files: ['__mocks__/**/*', '__tests__/**/*'],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals
    },
    ...pluginJest.configs['flat/recommended'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      '@typescript-eslint/unbound-method': 'off',
      'jest/unbound-method': 'error'
    }
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    ignores: ['__mocks__/**/*', '__tests__/**/*'],
    ...tseslint.configs.disableTypeChecked
  }
);
