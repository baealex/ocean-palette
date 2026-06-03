import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDir, '../..');
const serverRoot = path.join(workspaceRoot, 'packages/server');
const smokeDir = path.join(workspaceRoot, '.tmp/migration-smoke');
const defaultSourceDb = path.join(serverRoot, 'prisma/data/db.sqlite3');
const explicitSourceDb = process.env.MIGRATION_SMOKE_SOURCE_DB;
const sourceDb = explicitSourceDb
    ? path.resolve(explicitSourceDb)
    : defaultSourceDb;
const targetDb = path.join(smokeDir, 'db.sqlite3');
const databaseUrl = 'file:../../.tmp/migration-smoke/db.sqlite3';
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const sqliteSuffixes = ['', '-wal', '-shm'];

const runPnpm = (args) => {
    const result = childProcess.spawnSync(pnpmCommand, args, {
        cwd: serverRoot,
        env: {
            ...process.env,
            DATABASE_URL: databaseUrl,
        },
        stdio: 'inherit',
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
};

fs.rmSync(smokeDir, {
    force: true,
    recursive: true,
});
fs.mkdirSync(smokeDir, {
    recursive: true,
});

if (!fs.existsSync(sourceDb)) {
    if (explicitSourceDb) {
        throw new Error(`Migration smoke source DB was not found: ${sourceDb}`);
    }

    console.info('No default source DB found. Running migration smoke on a fresh SQLite database.');
} else {
    for (const suffix of sqliteSuffixes) {
        const sourcePath = `${sourceDb}${suffix}`;
        const targetPath = `${targetDb}${suffix}`;

        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, targetPath);
        }
    }

    console.info(`Copied migration smoke source DB to ${targetDb}`);
}

runPnpm(['exec', 'prisma', 'migrate', 'deploy']);
runPnpm(['exec', 'prisma', 'migrate', 'status']);
