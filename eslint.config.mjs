import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import pluginJest from 'eslint-plugin-jest';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['src/lib/weechat/parser.js', '.expo/**/*', 'android/**/*']
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  hooksPlugin.configs.flat.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: {
        ...globals.node
      },
      parser: tseslint.parser,
      parserOptions: {
        projectService: true
      }
    },
    settings: { react: { version: 'detect' } },
    rules: {
      eqeqeq: 'error',
      'no-param-reassign': ['error', { props: true }],

      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-deprecated': 'error',
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
        {
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowNullableBoolean: true,
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
