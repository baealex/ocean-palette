# Ocean Palette Dev Convention

Updated: 2026-04-26

## 1. Base Environment
- Node.js: `22.22.2` (`.nvmrc`)
- Package manager: `pnpm@10.25.0`
- Workspace: `packages/*` (pnpm workspace)

## 2. Local Development Commands
- Full dev mode: `pnpm dev`
- Client only: `pnpm dev:client`
- Server only: `pnpm dev:server`
- Full build: `pnpm build`
- Server start: `pnpm start`

## 3. Standard Quality Checks
- `pnpm check` (`lint + type-check + build`)
- `pnpm lint`
- `pnpm type-check`
- `pnpm build`

## 4. Minimum Rules Before PR
1. Complete local validation for changed scope.
2. Push only when CI is expected to pass.
3. Document script/env/doc changes in PR body.
4. Validate PR metadata against template before sharing PR link:
   - Title: `<emoji> <subject>` (Unicode emoji only)
   - Body sections: `:dart: Goal`, `:hammer_and_wrench: Core Changes`, `:brain: Key Decisions`, `:test_tube: Verification Guide`, `:white_check_mark: Checklist` (shortcode only)
   - Commit format: `<emoji> <subject>` (Unicode emoji only)

## 5. Server and Release Linked Rules
- Server start script includes `prisma migrate deploy`.
- Prisma uses `prisma.config.ts` for datasource URL resolution.
- Server runtime Prisma client uses the `@prisma/adapter-better-sqlite3` driver adapter.
- SQLite database URL remains `file:./prisma/data/db.sqlite3`.
- Server domain code lives under `packages/server/src/features/*`; root `schema`,
  `routes`, and `app.ts` should stay composition-only.
- Client Radix/Sonner usage should go through `@baejino/react-ui` wrappers when
  the shared package exposes the needed primitive.
- React Query invalidation should use domain helpers near each query key factory.

## 6. Related Documents
- Git rules: `docs/process/GIT_CONVENTION.md`
- Query key rules: `docs/process/QUERY_KEY_CONVENTION.md`
- Template alignment: `docs/process/TEMPLATE_ALIGNMENT.md`
- Deployment/release: `docs/process/DEPLOYMENT_RELEASE_STRATEGY.md`
