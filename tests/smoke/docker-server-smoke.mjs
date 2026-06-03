#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const DEFAULT_IMAGE = 'ocean-palette:docker-smoke';
const CONTAINER_PORT = 7768;
const READINESS_TIMEOUT_MS = 90_000;
const TINY_PNG_DATA_URL =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
    const arg = process.argv[index];
    if (!arg.startsWith('--')) {
        continue;
    }

    const key = arg.slice(2);
    const next = process.argv[index + 1];
    if (next && !next.startsWith('--')) {
        args.set(key, next);
        index += 1;
    } else {
        args.set(key, true);
    }
}

const image = String(
    args.get('image') || process.env.SMOKE_DOCKER_IMAGE || DEFAULT_IMAGE,
);
const dockerfile = String(
    args.get('dockerfile') || 'packages/server/Dockerfile',
);
const context = String(args.get('context') || '.');
const skipBuild = Boolean(args.get('skip-build'));
const keepContainer = Boolean(args.get('keep-container'));
const readinessTimeoutMs = Number(
    args.get('readiness-timeout-ms') || READINESS_TIMEOUT_MS,
);

let containerId = '';
let dataDir = '';
let assetsDir = '';

function run({ command, commandArgs, options = {} }) {
    const result = spawnSync(command, commandArgs, {
        stdio: options.stdio || 'pipe',
        encoding: 'utf8',
        ...options,
    });

    if (result.status !== 0) {
        const stderr = result.stderr ? `\n${result.stderr.trim()}` : '';
        const stdout = result.stdout ? `\n${result.stdout.trim()}` : '';
        throw new Error(
            `${command} ${commandArgs.join(' ')} failed with exit code ${result.status}${stdout}${stderr}`,
        );
    }

    return (result.stdout || '').trim();
}

function assertDockerReady() {
    try {
        run({
            command: 'docker',
            commandArgs: ['version', '--format', '{{.Server.Version}}'],
        });
        run({ command: 'docker', commandArgs: ['info'] });
    } catch (error) {
        throw new Error(
            `Docker daemon is required for smoke:docker. ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

function dockerBuild() {
    console.log(`[smoke:docker] Building ${image} from ${dockerfile}`);
    const result = spawnSync(
        'docker',
        ['build', '--file', dockerfile, '--tag', image, context],
        {
            stdio: 'inherit',
            encoding: 'utf8',
        },
    );

    if (result.status !== 0) {
        throw new Error(`docker build failed with exit code ${result.status}`);
    }
}

async function fetchText(url, options = {}) {
    const response = await fetch(url, {
        signal: AbortSignal.timeout(5_000),
        ...options,
    });
    return {
        response,
        text: await response.text(),
    };
}

async function waitForReady(baseUrl) {
    const startedAt = Date.now();
    let lastError = null;

    while (Date.now() - startedAt < readinessTimeoutMs) {
        try {
            const { response } = await fetchText(`${baseUrl}/api/home`);
            if (response.status === 200) {
                return;
            }
            lastError = new Error(`GET /api/home returned ${response.status}`);
        } catch (error) {
            lastError = error;
        }

        await delay(1_000);
    }

    throw new Error(
        `Container was not ready within ${readinessTimeoutMs}ms${
            lastError instanceof Error ? `: ${lastError.message}` : ''
        }`,
    );
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function assertAppShell(baseUrl) {
    const { response, text } = await fetchText(`${baseUrl}/`);
    assert(response.status === 200, `GET / returned ${response.status}`);
    assert(
        text.includes('Ocean Palette') || text.includes('id="root"'),
        'GET / did not include Ocean Palette app shell content',
    );
    console.log('[smoke:docker] GET / passed');
}

async function assertGraphqlRead(baseUrl) {
    const { response, text } = await fetchText(`${baseUrl}/graphql`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            query: 'query DockerSmokeCategories { allCategories { id name } }',
        }),
    });

    assert(
        response.status === 200,
        `POST /graphql returned ${response.status}: ${text}`,
    );

    let payload;
    try {
        payload = JSON.parse(text);
    } catch (error) {
        throw new Error(
            `POST /graphql did not return JSON: ${error instanceof Error ? error.message : String(error)}`,
        );
    }

    assert(
        !Array.isArray(payload.errors) || payload.errors.length === 0,
        `POST /graphql returned errors: ${JSON.stringify(payload.errors)}`,
    );
    assert(
        Array.isArray(payload.data?.allCategories),
        'POST /graphql allCategories was not an array',
    );
    console.log('[smoke:docker] POST /graphql allCategories passed');
}

async function assertReadEndpoint(baseUrl) {
    const { response, text } = await fetchText(`${baseUrl}/api/home`);
    assert(
        response.status === 200,
        `GET /api/home returned ${response.status}`,
    );
    assert(text.trim().length > 0, 'GET /api/home returned an empty body');
    console.log('[smoke:docker] GET /api/home passed');
}

async function assertImageUploadStorage(baseUrl) {
    const { response, text } = await fetchText(`${baseUrl}/api/image`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            image: TINY_PNG_DATA_URL,
        }),
    });

    assert(
        response.status === 200,
        `POST /api/image returned ${response.status}: ${text}`,
    );

    let payload;
    try {
        payload = JSON.parse(text);
    } catch (error) {
        throw new Error(
            `POST /api/image did not return JSON: ${error instanceof Error ? error.message : String(error)}`,
        );
    }

    assert(
        typeof payload.url === 'string' &&
            payload.url.startsWith('/assets/images/'),
        `POST /api/image returned unexpected url: ${payload.url}`,
    );

    const assetRelativePath = payload.url.slice('/assets/images/'.length);

    run({
        command: 'docker',
        commandArgs: [
            'exec',
            containerId,
            'test',
            '-f',
            `/assets/images/${assetRelativePath}`,
        ],
    });

    const { response: assetResponse } = await fetchText(
        `${baseUrl}${payload.url}`,
    );
    assert(
        assetResponse.status === 200,
        `GET ${payload.url} returned ${assetResponse.status}`,
    );

    console.log('[smoke:docker] image upload storage passed');
}

function assertStorageContract() {
    const databaseUrl = run({
        command: 'docker',
        commandArgs: ['exec', containerId, 'printenv', 'DATABASE_URL'],
    });
    const imageDir = run({
        command: 'docker',
        commandArgs: ['exec', containerId, 'printenv', 'OCEAN_PALETTE_IMAGE_DIR'],
    });

    assert(
        databaseUrl === 'file:/data/db.sqlite3',
        `Expected DATABASE_URL to be file:/data/db.sqlite3, got ${databaseUrl}`,
    );
    assert(
        imageDir === '/assets/images',
        `Expected OCEAN_PALETTE_IMAGE_DIR to be /assets/images, got ${imageDir}`,
    );

    run({
        command: 'docker',
        commandArgs: ['exec', containerId, 'test', '-f', '/data/db.sqlite3'],
    });
    run({
        command: 'docker',
        commandArgs: ['exec', containerId, 'test', '-d', '/assets/images'],
    });
    run({
        command: 'docker',
        commandArgs: [
            'exec',
            containerId,
            'test',
            '!',
            '-e',
            '/app/packages/server/prisma/data',
        ],
    });
    run({
        command: 'docker',
        commandArgs: [
            'exec',
            containerId,
            'test',
            '!',
            '-e',
            '/app/packages/server/public/assets',
        ],
    });

    console.log('[smoke:docker] storage contract passed');
}

async function collectLogs() {
    if (!containerId) {
        return;
    }

    const logs = spawnSync('docker', ['logs', '--tail', '200', containerId], {
        stdio: 'pipe',
        encoding: 'utf8',
    });

    if (logs.stdout || logs.stderr) {
        console.error('\n[smoke:docker] Container logs:');
        if (logs.stdout) {
            console.error(logs.stdout.trim());
        }
        if (logs.stderr) {
            console.error(logs.stderr.trim());
        }
    }
}

async function cleanup() {
    if (containerId && !keepContainer) {
        spawnSync('docker', ['rm', '--force', containerId], {
            stdio: 'ignore',
        });
    }

    await Promise.all(
        [dataDir, assetsDir]
            .filter(Boolean)
            .map((dir) => rm(dir, { recursive: true, force: true })),
    );
}

async function main() {
    assertDockerReady();

    if (!skipBuild) {
        dockerBuild();
    } else {
        console.log(`[smoke:docker] Using prebuilt image ${image}`);
    }

    dataDir = await mkdtemp(path.join(tmpdir(), 'ocean-palette-data-'));
    assetsDir = await mkdtemp(path.join(tmpdir(), 'ocean-palette-assets-'));

    containerId = run({
        command: 'docker',
        commandArgs: [
            'run',
            '--detach',
            '--publish',
            `127.0.0.1::${CONTAINER_PORT}`,
            '--mount',
            `type=bind,source=${dataDir},target=/data`,
            '--mount',
            `type=bind,source=${assetsDir},target=/assets`,
            image,
        ],
    });

    const hostPort = run({
        command: 'docker',
        commandArgs: [
            'inspect',
            '--format',
            `{{(index (index .NetworkSettings.Ports "${CONTAINER_PORT}/tcp") 0).HostPort}}`,
            containerId,
        ],
    });
    const baseUrl = `http://127.0.0.1:${hostPort}`;
    console.log(
        `[smoke:docker] Started ${containerId.slice(0, 12)} at ${baseUrl}`,
    );

    await waitForReady(baseUrl);
    await assertAppShell(baseUrl);
    await assertGraphqlRead(baseUrl);
    await assertReadEndpoint(baseUrl);
    assertStorageContract();
    await assertImageUploadStorage(baseUrl);

    console.log('[smoke:docker] Docker smoke passed');
}

try {
    await main();
} catch (error) {
    console.error(
        `[smoke:docker] ${error instanceof Error ? error.message : String(error)}`,
    );
    await collectLogs();
    process.exitCode = 1;
} finally {
    await cleanup();
}
