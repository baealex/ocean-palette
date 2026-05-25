# API Refactor Candidates

Updated: 2026-05-25

## Purpose

This note records safe candidates for gradually splitting large API-facing files. It is a planning document only. Do not change public import paths until each split has a small compatibility layer and validation plan.

## Candidate selection criteria

- File size: large enough to slow review or make unrelated changes collide.
- Mixed responsibility: schema, request parsing, query building, resolver/controller logic, or service runtime state in one file.
- Import surface: how many callers may be affected by a split.
- Split safety: whether a first step can move private helpers without changing exported names.
- Validation: whether existing tests or `pnpm check` can cover the change.

## Current API-facing structure

| Area | File | Size | Main responsibilities | Current import surface |
| --- | --- | ---: | --- | --- |
| Client GraphQL API | `packages/client/src/features/{category,collection,keyword}/api.ts` plus `packages/client/src/api/graphql.ts` | feature-based | Feature-owned category, collection, and keyword GraphQL operations with compatibility barrel | Feature code imports from feature API modules; `packages/client/src/api/index.ts` remains a compatibility layer |
| Client live REST API | `packages/client/src/features/live/api.ts` | feature-based | Live config/status/image REST response types and axios wrappers | Feature code imports from `~/features/live/api`; `packages/client/src/api/index.ts` remains a compatibility layer |
| Server collection GraphQL | `packages/server/src/features/collection/graphql/index.ts` plus private helper modules | split | Collection type definitions, query/mutation schema, resolvers, query helpers, metadata payload mapping | Imported by `packages/server/src/schema/index.ts`; private helpers stay inside the collection GraphQL folder |
| Server keyword GraphQL | `packages/server/src/features/keyword/graphql/index.ts` | 351 lines | Keyword type definitions, order helper, resolvers | Imported by `packages/server/src/schema/index.ts`; `keywordType` also imported by category GraphQL |
| Server category GraphQL | `packages/server/src/features/category/graphql/index.ts` | 211 lines | Category type definitions, order helper, resolvers | Imported by `packages/server/src/schema/index.ts` |
| Server live HTTP controllers | `packages/server/src/features/live/http.ts` | 403 lines | Request parsing, directory browsing, live config/status/image controllers | Imported through live router; tests exist in `packages/server/src/features/live/http.test.ts` |
| Server live service | `packages/server/src/features/live/live-images.ts` | 663 lines | Socket setup, config apply, status, list/delete/sync APIs, watcher lifecycle, ingest, emit queue, mutation queue | Exported through `packages/server/src/features/live/index.ts`; used by server main, live HTTP, and collection GraphQL |

## Recommended split order

### 1. `packages/server/src/features/collection/graphql/index.ts`

Status: first split completed.

What changed:

- Filter/order/date normalization helpers moved to `query-helpers.ts`.
- `toGeneratedMetadataPayload` moved to `metadata-payload.ts`.
- `CollectionTypeDefs` and `CollectionResolvers` remain exported from `index.ts`.
- The schema composer import surface stays unchanged: `~/features/collection/graphql`.

Preserved behavior:

- Default limit remains `60` and max limit remains `200`.
- Default order remains `desc` and default order field remains `createdAt`.
- Default date filtering still targets collection `createdAt`; `generated_at` still targets image `generatedAt`.
- Metadata payload fields still come from the live image metadata parser.

Validation:

- `pnpm --filter @ocean-palette/server run test`
- `pnpm --filter @ocean-palette/server run type-check`
- `pnpm --filter @ocean-palette/server run lint`
- `pnpm check`

### 2. `packages/client/src/api/graphql.ts`

Status: completed in the first split.

What changed:

- `packages/client/src/api/graphql.ts` is now a compatibility barrel.
- Category operations moved to `packages/client/src/features/category/api.ts`.
- Collection operations and collection filter/pagination types moved to `packages/client/src/features/collection/api.ts`.
- Keyword and sample image operations moved to `packages/client/src/features/keyword/api.ts`.
- Image upload/metadata REST calls moved to `packages/client/src/features/image/api.ts`.
- Live REST calls moved to `packages/client/src/features/live/api.ts`.
- `packages/client/src/api/index.ts` still re-exports the same public API surface for compatibility, but client code should not add new `~/api` imports.

Remaining risk:

- Type exports like `CollectionDateField` and `CollectionSearchBy` remain public through `~/features/collection/api`; keep this stable while filters and query keys depend on it.
- Tests now mock the feature API modules directly. Keep mocks near the feature boundary instead of going through `~/api`.

Next cleanup options:

1. Keep `~/api` as a compatibility layer until external or older internal imports are no longer needed.
2. Add API export-shape tests only if later refactors start changing compatibility exports.

Validation:

- `pnpm check`
- Confirm imports from the `~/api` alias still resolve.

### 3. `packages/server/src/features/live/live-images.ts`

Priority: medium-high, but split only after a narrower plan.

Why not first:

- It is the largest API-adjacent runtime file at 663 lines.
- It has more stateful behavior than the GraphQL files: socket state, watcher state, sync state, prompt cache, ingest queue, and file mutation queue.
- Several helper classes already exist nearby, so another split should be based on runtime boundaries, not line count alone.

Suggested first split:

1. Extract socket emit/status helpers only if the public `liveImagesService` instance remains unchanged.
2. Or extract prompt/metadata read methods if they can stay pure around the repositories.

Risk:

- Watcher and ingest code has side effects on the file system and socket events. A careless split can change timing or duplicate events.
- Collection GraphQL imports live metadata conversion through the `~/features/live` alias, so exported names in `packages/server/src/features/live/index.ts` must stay stable.

Validation:

- `pnpm check`
- Live image unit tests, especially watcher, ingest, queue, image repository, and HTTP tests.

### 4. `packages/server/src/features/live/http.ts`

Priority: medium.

Why later:

- It is 403 lines and clearly mixes request parsing, directory browsing, and controllers.
- It has a safer first split than the live service: move `parseBoolean`, `parseId`, path parsing, and directory listing helpers to private helper modules.

Risk:

- Directory listing behavior differs by platform. Keep Windows root handling and root path checks intact.
- Controller response shapes are consumed by `packages/client/src/api/live.ts`.

Validation:

- `pnpm check`
- `packages/server/src/features/live/http.test.ts`

### 5. `packages/server/src/features/keyword/graphql/index.ts` and `packages/server/src/features/category/graphql/index.ts`

Priority: lower.

Why lower:

- Both are smaller than the collection GraphQL file.
- They share an order-clamping pattern, but extracting it too early may create a shared helper before the desired GraphQL split shape is clear.

Suggested first split:

- After the collection GraphQL split, consider moving duplicated order helpers into a local feature utility only if tests show the behavior is identical.

Risk:

- `category/graphql/index.ts` imports `keywordType`; schema string composition can be sensitive to duplicate type definitions.

Validation:

- `pnpm check`
- Category and keyword GraphQL tests.

## Guardrails for future refactors

- Keep existing public imports working, but new client code should import from feature API modules instead of the `~/api` compatibility layer.
- Prefer moving private helpers first. Move exported API functions only behind a barrel file.
- Split one responsibility per pull request.
- Add or keep tests around filtering, ordering, response shapes, and live image side effects.
- Do not add credits or `Co-authored-by` lines to commits, PRs, code comments, or docs.
