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
        '**/routeTree.gen.ts',
    ]),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommendedTypeChecked,
            tseslint.configs.strictTypeChecked,
            tseslint.configs.stylisticTypeChecked,
        ],
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.node,
                Bun: 'readonly',
            },
            parserOptions: {
                project: [
                    path.join(rootDir, 'apps/backend/tsconfig.json'),
                    path.join(rootDir, 'apps/frontend/tsconfig.json'),
                    path.join(rootDir, 'apps/frontend/tsconfig.app.json'),
                    path.join(rootDir, 'apps/frontend/tsconfig.node.json'),
                    path.join(rootDir, 'apps/frontend/tsconfig.e2e.json'),
                ],
                tsconfigRootDir: rootDir,
            },
        },
    },
    {
        files: ['**/backend/src/modules/*/*.service.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['../*/*.model'],
                            message:
                                "Services may not import a sibling module's model. Call the peer service (e.g. eventsService.requireRawById) instead.",
                        },
                    ],
                },
            ],
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
