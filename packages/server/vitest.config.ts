import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '~': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        globals: true,
        include: ['src/**/*.test.ts'],
        setupFiles: ['./vitest.setup.ts'],
        pool: 'forks',
        maxWorkers: 1,
        minWorkers: 1,
    },
});
