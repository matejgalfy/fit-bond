import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactDom from 'eslint-plugin-react-dom';
import reactX from 'eslint-plugin-react-x';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import path from 'path';

const rootDir = import.meta.dirname;

export default defineConfig([
    globalIgnores([
        'dist',
        'node_modules',
        'build',
        '.next',
        'coverage',
        'bun.lock',
    ]),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            tseslint.configs.recommendedTypeChecked,
            tseslint.configs.strictTypeChecked,
            tseslint.configs.stylisticTypeChecked,
            js.configs.recommended,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                project: [
                    path.join(rootDir, 'apps/backend/tsconfig.json'),
                    path.join(rootDir, 'apps/frontend/tsconfig.json'),
                    path.join(rootDir, 'apps/frontend/tsconfig.app.json'),
                    path.join(rootDir, 'apps/frontend/tsconfig.node.json'),
                ],
                tsconfigRootDir: rootDir,
            },
        },
    },
    {
        files: ['**/frontend/**/*.{ts,tsx}', '**/*.test.tsx'],
        extends: [
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
            reactDom.configs.recommended,
            reactX.configs['recommended-typescript'],
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
    },
]);
