# Ocean Palette Deployment and Release Strategy

Updated: 2026-06-03

## 1. Scope
- This document defines deployment and operational release rules for `ocean-palette`.
- Current policy: **Docker version-tag distribution only**.
- npm distribution is not used for this project.

## 2. Deployment Channels
1. DockerHub image
- Image: `baealex/ocean-palette`
- Published tags: exact version tags only, for example `1.1.0`
- Floating `latest` is not updated by the release workflow.
- Multi-arch targets: `linux/amd64`, `linux/arm64`

2. Source-based run
- `pnpm install && pnpm start`
- `pnpm start` runs client build and then starts server.

## 3. Versioned Install Rules
1. Docker run
```bash
docker run \
  -v ./data:/data \
  -v ./assets:/assets \
  -p 7768:7768 \
  baealex/ocean-palette:<exact-version>
```

2. Docker Compose
```bash
OCEAN_PALETTE_VERSION=<exact-version> docker compose up -d
```

3. Production rule
- Always pin an exact image tag.
- Do not use `baealex/ocean-palette`, `baealex/ocean-palette:latest`, or any other floating tag for installs or upgrades.

4. Existing `latest` tag
- Existing `latest` images are treated as legacy.
- New releases do not update `latest`.
- This prevents `docker pull` or tag-less compose runs from silently applying a storage-contract change.

## 4. Release Trigger
- GitHub Actions `RELEASE` runs only on an explicit `v*` tag push.
- Example: `v1.1.0`
- Official release trigger:

```bash
git tag v1.1.0
git push origin v1.1.0
```

- Do not treat PR merge itself as deployment.
- Do not rely on automatic tag creation as the release trigger.
- Every tagged release must have a GitHub Release page:
  `https://github.com/baealex/ocean-palette/releases/tag/vX.Y.Z`

## 5. Release Pipeline
1. `smoke`
- Builds a local Docker image.
- Runs `pnpm smoke:docker` before publishing.
- Verifies app/API health and Docker storage contract.

2. `publish-docker`
- Runs after `smoke`.
- Extracts version from tag (`vX.Y.Z` -> `X.Y.Z`).
- Builds and pushes architecture digests to DockerHub.
- Requires `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`.

3. `publish-docker-manifest`
- Combines architecture digests into one manifest.
- Pushes only the exact version tag: `baealex/ocean-palette:X.Y.Z`.
- Does not push `latest`.
- Creates a GitHub Release with generated notes.

## 6. Runtime and Data Contracts
1. App port
- Container app port: `7768`
- Example host mapping in `docker-compose.yml`: `7768:7768`

2. Persistent volumes
- `/data`: database persistence
- `/assets`: image/static assets persistence
- In Docker, `packages/server/prisma/data` must be a symlink to `/data`.
- In Docker, `packages/server/public/assets` must be a symlink to `/assets`.

3. Startup migration behavior
- Server start path runs `prisma generate` and `prisma migrate deploy` before app boot.
- Any deployment target must provide writable persistent volume for DB files.

4. Storage-contract changes
- Changing Docker storage symlinks is data-impacting even when the database schema does not change.
- A new image cannot automatically rescue DB or asset files that were written into an old container layer.
- Release notes for storage-contract changes must include user-facing migration guidance for both `docker run` and Docker Compose.
- Migration guidance must copy any rescued old-container DB/assets into a staging directory first, not directly over mounted `./data` or `./assets`.

## 7. Pre-Merge and Release Guardrails
1. Before merge to `main`
- CI checks for changed scope must pass.
- Confirm migration impact and data compatibility.
- Release-impacting PRs must name the expected version tag and verification plan.

2. Release-impacting or data-impacting criteria
- Require a checked PR item and release note plan when any of the following changes are included:
  - Database schema, Prisma migration, migration startup behavior, or database file path changes
  - Authentication, authorization, session, token, or credential handling changes
  - Runtime environment variable additions, removals, default changes, or required secret changes
  - Persistent volume layout, mount path, writable path, asset storage path, or backup/restore expectation changes
  - Release workflow, Docker image tag policy, or Dockerfile changes

3. Before pushing `v*`
- Confirm the target commit is merged into `main`.
- Confirm PR CI has passed.
- Confirm `pnpm smoke:docker` is expected to pass in GitHub Actions.
- Confirm user-facing release notes are ready when the change requires user action.

4. After release
- Monitor `RELEASE` workflow completion.
- Record the published image digest.
- Verify the versioned image tag on DockerHub.
- Open the GitHub Release page and finalize release notes before sharing externally.

## 8. Rollback Strategy
1. Recommended rollback
- Deploy a previous exact version tag:
  `baealex/ocean-palette:<previous-version>`

2. Digest rollback
- Record image digest after each release.
- Deploy by digest for reproducibility:
  `baealex/ocean-palette@sha256:<digest>`

3. No latest rollback
- Do not use `latest` as a rollback target.
- Reverting `main` does not publish a replacement image. A new `v*` tag is required.

## 9. Smoke Test Policy
- The repository is an app/server deployment target, not an npm package distribution target.
- Smoke tests should verify deployable behavior: built client assets, production server startup, migration path, and core HTTP/GraphQL UI flows.
- `pnpm test:e2e` builds the server and client, starts the production server path with an isolated SQLite database, then checks the app shell and empty collection GraphQL flow.
- `pnpm smoke:docker` builds or runs a Docker image and verifies app/API health plus Docker storage contract.
- Do not add `npm publish`, `npm pack`, `npx <published-cli>`, or CLI-package smoke checks unless the release policy changes to include npm distribution.

## 10. Runtime Environment Reference
- Source run default: `packages/server/.env` sets `DATABASE_URL="file:./prisma/data/db.sqlite3"`.
- Example file: `packages/server/.env.example`.
- Container default: `packages/server/Dockerfile` sets `DATABASE_URL=file:./prisma/data/db.sqlite3`; `/data` is linked into that database directory at runtime.
- Container asset default: `/assets` is linked to `packages/server/public/assets`, so app URLs under `/assets/images` map to the mounted `./assets/images` directory.
- Treat changes to required env vars, defaults, or secret names as release-impacting.

## 11. Required Secrets
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

## 12. Out of Scope
- npm package publishing
- npm trusted publishing / OIDC release pipeline
