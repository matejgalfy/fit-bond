import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        tanstackRouter({ target: 'react', autoCodeSplitting: true }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        dedupe: ['react', 'react-dom'],
    },
    server: {
        port: 5173,
        strictPort: true,
    },
    test: {
        include: [
            '**/*.{test,spec}.?(c|m)[jt]s?(x)',
            '**/*-test.?(c|m)[jt]s?(x)',
        ],
        exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
    },
});
