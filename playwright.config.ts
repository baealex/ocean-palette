import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.E2E_PORT ?? 7769);
const baseURL = `http://127.0.0.1:${port}`;
const databaseUrl = 'file:../../.tmp/e2e/db.sqlite3';
const webServerEnv = Object.fromEntries(
    Object.entries(process.env).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
);

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
        command: 'node tests/e2e/web-server.mjs',
        env: {
            ...webServerEnv,
            DATABASE_URL: databaseUrl,
            E2E_PORT: String(port),
            PORT: String(port),
        },
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
