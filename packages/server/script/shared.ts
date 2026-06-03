import fs from 'fs';
import childProcess from 'child_process';
import path from 'path';

const prismaPath = path.resolve(__dirname, '../prisma');
const packageRootPath = path.resolve(__dirname, '..');
const workspaceRootPath = path.resolve(packageRootPath, '../..');

const createPrismaBinPath = (basePath: string) =>
    process.platform === 'win32'
        ? path.resolve(basePath, 'node_modules/.bin/prisma.CMD')
        : path.resolve(basePath, 'node_modules/.bin/prisma');

const prismaBinPathCandidates = [
    createPrismaBinPath(packageRootPath),
    createPrismaBinPath(workspaceRootPath),
];

const prismaBinPath =
    prismaBinPathCandidates.find((binPath) => fs.existsSync(binPath)) ??
    prismaBinPathCandidates[0];

const runPrisma = (command: string) => {
    childProcess.execSync(`"${prismaBinPath}" ${command}`, {
        cwd: packageRootPath,
        stdio: 'inherit',
    });
};

export const createDatabase = async () => {
    const databasePath = process.env.DATABASE_URL
        ? resolveSqliteDatabasePath(process.env.DATABASE_URL)
        : null;

    if (databasePath) {
        fs.mkdirSync(path.dirname(databasePath), {
            recursive: true,
        });
    }

    runPrisma('generate');
    runPrisma('migrate deploy');
};

const databaseFileSuffixes = ['', '-journal', '-wal', '-shm'];

export const resolveSqliteDatabasePath = (databaseUrl: string) => {
    if (!databaseUrl.startsWith('file:')) {
        return null;
    }

    const databasePath = databaseUrl.slice('file:'.length);

    if (!databasePath) {
        return null;
    }

    return path.isAbsolute(databasePath)
        ? databasePath
        : path.resolve(packageRootPath, databasePath);
};

const getDatabaseFilePaths = (fileNameOrUrl: string) => {
    const databasePath = resolveSqliteDatabasePath(fileNameOrUrl);

    if (databasePath) {
        return [databasePath];
    }

    return [
        path.resolve(packageRootPath, fileNameOrUrl),
        path.resolve(prismaPath, fileNameOrUrl),
    ];
};

export const removeDatabase = async (fileNameOrUrl = 'db.sqlite3') => {
    for (const databasePath of getDatabaseFilePaths(fileNameOrUrl)) {
        for (const suffix of databaseFileSuffixes) {
            const targetPath = `${databasePath}${suffix}`;
            if (fs.existsSync(targetPath)) {
                fs.unlinkSync(targetPath);
            }
        }
    }
};
