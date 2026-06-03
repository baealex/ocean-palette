# Ocean Palette Deployment and Release Strategy

Updated: 2026-05-21

## 1. Scope
- This document defines deployment and operational release rules for `ocean-palette`.
- Current policy: **npm distribution is not used** for this project.

## 2. Deployment Channels (Current)
1. DockerHub image (primary)
- Image: `baealex/ocean-palette`
- Active tag policy: `latest` only
- `latest` publishing is manual through the `BUILD IMAGE` workflow gate.
- Architectures: `linux/amd64`, `linux/arm64/v8`

2. Source-based run (local or self-managed host)
- `pnpm install && pnpm start`
- `pnpm start` runs client build and then starts server.

## 3. CI/CD Topology (As-Is)
1. CI workflow
- File: `.github/workflows/CI.yml`
- Triggers:
  - `push` to `main`
  - `pull_request` to `main`
  - `workflow_dispatch`
- Runtime: Node from `.nvmrc`
- Gates:
  - Server: lint, test, typecheck, build
  - Client: lint, typecheck, react-compiler healthcheck, test, build
  - E2E smoke: Playwright Chromium smoke against the built client and production server start path

2. Image build workflow
- File: `.github/workflows/BUILD_IMAGE.yml`
- Trigger: manual `workflow_dispatch`
- Action: build and push Docker image from `packages/server/Dockerfile` after an operator intentionally starts the workflow
- Published tag: `baealex/ocean-palette:latest`

3. Important implication
- There is no `v*` tag-based release workflow.
- Merging validated changes into `main` does not publish `latest` by itself.
- Publishing `latest` requires an operator to run `BUILD IMAGE` after checking the release gate items in Section 7.

## 4. Runtime and Data Contracts
1. App port
- Container app port: `7768`
- Example host mapping in `docker-compose.yml`: `7768:7768`

2. Persistent volumes
- `/data`: database persistence
- `/assets`: image/static assets persistence

3. Startup migration behavior
- Server start path runs `prisma generate` and `prisma migrate deploy` before app boot.
- Any deployment target must provide writable persistent volume for DB files.

## 5. Deployment Runbook
1. Docker (recommended)
```bash
docker run \
  -v ./data:/data \
  -v ./assets:/assets \
  -p 7768:7768 \
  baealex/ocean-palette:latest
```

2. Docker Compose
```bash
docker compose up -d
```
- Uses `docker-compose.yml` image `baealex/ocean-palette` (default tag: `latest`).

3. Source run
```bash
pnpm install
pnpm start
```

## 6. Rollback Strategy (Latest-Only Policy)
1. Recommended for production-like environments
- Record image digest after each deployment.
- Deploy by digest for reproducibility:
  - `baealex/ocean-palette@sha256:<digest>`

2. If digest was not recorded
- Rollback reproducibility is limited with `latest`-only policy.
- Revert application changes in `main`, let CI pass, then let `BUILD IMAGE` publish a new `latest`.

## 7. Pre-Merge and Deploy Guardrails
1. Before merge to `main`
- CI checks for changed scope must pass.
- Confirm migration impact and data compatibility.
- Run the manual `BUILD IMAGE` workflow only after release-impacting and data-impacting checks are explicitly resolved.

2. Release-impacting or data-impacting criteria
- Require a manual deployment gate, or at minimum a checked PR item that explicitly marks the change as release-impacting, when any of the following changes are included:
  - Database schema, Prisma migration, migration startup behavior, or database file path changes
  - Authentication, authorization, session, token, or credential handling changes
  - Runtime environment variable additions, removals, default changes, or required secret changes
  - Persistent volume layout, mount path, writable path, asset storage path, or backup/restore expectation changes
- The gate must name the operator action needed before `latest` is applied, such as backup, migration review, environment update, volume remount, or rollback digest capture.
- Ordinary UI/code/docs changes may use the manual `latest` publishing flow after CI passes.

3. Before applying new container in production-like host
- Backup mounted `./data` volume when the change is data-impacting, migration-related, or storage-path-related.
- Confirm writable mount permissions for `/data` and `/assets`.
- Confirm required environment variables and secrets match the deployed image.
- Record the published image digest before replacing the running container.

4. After deployment
- Verify container health and startup logs.
- Open the service URL and confirm core user flows (home, collection, image metadata read).

## 8. Smoke Test Policy
- The repository is an app/server deployment target, not an npm package distribution target.
- Smoke tests should verify deployable behavior: built client assets, production server startup, migration path, and core HTTP/GraphQL UI flows.
- The current CI smoke is `pnpm test:e2e`, backed by Playwright. It builds the server and client, starts the production server path with an isolated SQLite database, then checks the app shell and empty collection GraphQL flow.
- Migration smoke is `pnpm smoke:migration`. It copies `packages/server/prisma/data/db.sqlite3` to `.tmp/migration-smoke/db.sqlite3` when the default DB exists, then runs `prisma migrate deploy` and `prisma migrate status` against the copy only.
- To smoke-test a backup copy, run `MIGRATION_SMOKE_SOURCE_DB=/path/to/backup.sqlite3 pnpm smoke:migration`. On Windows PowerShell, use `$env:MIGRATION_SMOKE_SOURCE_DB="C:\path\backup.sqlite3"; pnpm smoke:migration`.
- Do not add `npm publish`, `npm pack`, `npx <published-cli>`, or CLI-package smoke checks unless the release policy changes to include npm distribution.

## 9. Runtime Environment Reference
- Source run default: `packages/server/.env` sets `DATABASE_URL="file:./prisma/data/db.sqlite3"`.
- Example file: `packages/server/.env.example`.
- Container default: `packages/server/Dockerfile` sets `DATABASE_URL=file:./prisma/data/db.sqlite3`; `/data` is linked into that database directory at runtime.
- Treat changes to required env vars, defaults, or secret names as release-impacting.

## 10. Required Build Secrets
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

## 11. Out of Scope (Current Policy)
- npm package publishing
- npm trusted publishing / OIDC release pipeline
- GitHub Releases auto-notes workflow
