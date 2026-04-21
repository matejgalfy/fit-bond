// This app uses the shared ESLint configuration from the workspace root (../../eslint.config.js)

import rootConfig from '../../eslint.config.js';

export default [
    ...rootConfig,
    {
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
        },
    },
];
