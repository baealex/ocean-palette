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
| Client GraphQL API | `packages/client/src/api/graphql.ts` | 436 lines | Category, keyword, collection GraphQL operations and shared collection request types | Re-exported by `packages/client/src/api/index.ts`; feature code imports from the `~/api` alias |
| Client live REST API | `packages/client/src/api/live.ts` | 175 lines | Live config/status/image REST response types and axios wrappers | Re-exported by `packages/client/src/api/index.ts`; mainly collection live-control code |
| Server collection GraphQL | `packages/server/src/features/collection/graphql/index.ts` | 604 lines | Collection type definitions, query/mutation schema, filter/order/date helpers, metadata payload mapping, resolvers | Imported by `packages/server/src/schema/index.ts`; depends on the `~/features/live` alias metadata helpers |
| Server keyword GraphQL | `packages/server/src/features/keyword/graphql/index.ts` | 351 lines | Keyword type definitions, order helper, resolvers | Imported by `packages/server/src/schema/index.ts`; `keywordType` also imported by category GraphQL |
| Server category GraphQL | `packages/server/src/features/category/graphql/index.ts` | 211 lines | Category type definitions, order helper, resolvers | Imported by `packages/server/src/schema/index.ts` |
| Server live HTTP controllers | `packages/server/src/features/live/http.ts` | 403 lines | Request parsing, directory browsing, live config/status/image controllers | Imported through live router; tests exist in `packages/server/src/features/live/http.test.ts` |
| Server live service | `packages/server/src/features/live/live-images.ts` | 663 lines | Socket setup, config apply, status, list/delete/sync APIs, watcher lifecycle, ingest, emit queue, mutation queue | Exported through `packages/server/src/features/live/index.ts`; used by server main, live HTTP, and collection GraphQL |

## Recommended split order

### 1. `packages/server/src/features/collection/graphql/index.ts`

Priority: highest.

Why first:

- It is the largest API boundary file found in GraphQL code at 604 lines.
- The file mixes four responsibilities: GraphQL schema strings, resolver functions, query input normalization, and generated metadata payload mapping.
- The import surface is small: the schema composer imports `CollectionTypeDefs` and `CollectionResolvers` from this directory. That makes it safe to keep `index.ts` as a barrel while moving private pieces.

Suggested first split:

1. Move filter/order/date helpers to `query-helpers.ts`.
2. Move `toGeneratedMetadataPayload` to `metadata-payload.ts`.
3. Keep `CollectionTypeDefs` and `CollectionResolvers` exported from `index.ts`.

Risk:

- Collection filtering and ordering are user-visible. Preserve defaults: limit `60`, max limit `200`, order `desc`, default order field `createdAt`, default date field behavior.
- Metadata fields are shared with live image parsing. Check prompt/model fields after moving mapper code.

Validation:

- `pnpm check`
- If narrowing validation, run collection GraphQL tests plus type-check.

### 2. `packages/client/src/api/graphql.ts`

Priority: high.

Why next:

- It is the largest client API wrapper at 436 lines.
- It combines category, keyword, collection, pagination/search types, and legacy escaping in one public module.
- Many callers import from the `~/api` alias, not from this file directly, so `packages/client/src/api/index.ts` can preserve the public path while domain files are introduced.

Suggested first split:

1. Create future domain files for category, keyword, and collection GraphQL API modules.
2. Keep `packages/client/src/api/graphql.ts` as a compatibility barrel during the first step.
3. Keep `packages/client/src/api/index.ts` exports unchanged.

Risk:

- Type exports like `CollectionDateField` and `CollectionSearchBy` are used by filters and query keys. Losing those exports would break compile-time contracts even if runtime behavior is unchanged.
- Tests mock the `~/api` alias, so changing the top-level export shape can break tests.

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

- Keep existing public imports working, especially the `~/api` alias on the client and the `~/features/live` alias on the server.
- Prefer moving private helpers first. Move exported API functions only behind a barrel file.
- Split one responsibility per pull request.
- Add or keep tests around filtering, ordering, response shapes, and live image side effects.
- Do not add credits or `Co-authored-by` lines to commits, PRs, code comments, or docs.
