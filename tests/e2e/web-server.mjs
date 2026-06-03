import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDir, '../..');
const serverRoot = path.join(workspaceRoot, 'packages/server');
const e2eDir = path.join(workspaceRoot, '.tmp/e2e');
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const port = process.env.E2E_PORT ?? '7769';
const databaseUrl = process.env.DATABASE_URL ?? 'file:../../.tmp/e2e/db.sqlite3';

const runPnpm = ({ args, cwd, env = process.env }) => {
    const result = childProcess.spawnSync(pnpmCommand, args, {
        cwd,
        env,
        stdio: 'inherit',
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
};

fs.rmSync(e2eDir, {
    force: true,
    recursive: true,
});
fs.mkdirSync(e2eDir, {
    recursive: true,
});

runPnpm({
    args: ['build'],
    cwd: workspaceRoot,
});

const server = childProcess.spawn(
    pnpmCommand,
    ['exec', 'ts-node', 'script/_start.ts'],
    {
        cwd: serverRoot,
        env: {
            ...process.env,
            DATABASE_URL: databaseUrl,
            PORT: port,
        },
        stdio: 'inherit',
    },
);

let shuttingDown = false;

const shutdown = (signal) => {
    shuttingDown = true;
    server.kill(signal);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

server.on('exit', (code, signal) => {
    if (shuttingDown) {
        process.exit(0);
    }

    process.exit(code ?? (signal ? 1 : 0));
});
