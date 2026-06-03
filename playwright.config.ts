import path from 'path';
import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.E2E_PORT ?? 7769);
const baseURL = `http://127.0.0.1:${port}`;
const e2eDir = path.resolve('.tmp/e2e');
const databaseUrl = `file:${path.join(e2eDir, 'db.sqlite3')}`;

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 30_000,
    expect: {
        timeout: 5_000,
    },
    use: {
        baseURL,
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: [
            'rm -rf .tmp/e2e',
            'mkdir -p .tmp/e2e',
            'pnpm build',
            [
                'cd packages/server',
                `DATABASE_URL="${databaseUrl}" PORT="${port}" pnpm exec tsx script/_start.ts`,
            ].join(' && '),
        ].join(' && '),
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
