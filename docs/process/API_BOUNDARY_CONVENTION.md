# API Boundary Convention

Updated: 2026-05-25

## 1. Purpose

This document explains how Ocean Palette chooses API boundaries. It is not a migration plan and it is not a rule to make every Ocean repository look the same.

Use this order:

1. Decide the route or use-case first.
2. Decide the response shape the caller needs.
3. Choose GraphQL or REST/HTTP after that.

Do not pick a protocol first and then force the route to fit it.

## 2. Route-first rule

Start from the user or system path that needs the API.

- Screen route: what does this screen need to render or update?
- Feature use-case: what is the smallest action the feature owns?
- Browser route: is this serving a page, static asset, or client fallback?
- System route: is this health, readiness, session, file, stream, or background status?

After the route or use-case is clear, choose the boundary that makes the contract easiest to review and test.

## 3. When GraphQL fits

Use GraphQL when the route needs a typed read model or a grouped view of related data.

Good fits:

- Screen data that joins several related models.
- Read models where the client benefits from selecting a clear typed shape.
- Queries where pagination, filters, ordering, and nested fields belong to one screen contract.
- Mutations that already belong to a GraphQL feature and return a small typed result used by the same screen flow.

Current Ocean Palette examples:

- Client GraphQL operations live near their feature in `packages/client/src/features/{category,collection,keyword}/api.ts`.
- The server GraphQL schema is composed in `packages/server/src/schema/index.ts` from feature GraphQL modules under `packages/server/src/features/*/graphql`.
- `packages/client/src/api/graphql.ts` is a compatibility barrel, not the preferred place for new feature APIs.

GraphQL does not mean every endpoint must move to GraphQL. If the use-case is file-like, session-like, health-like, streaming, or browser routing, prefer REST/HTTP.

## 4. When REST/HTTP fits

Use REST/HTTP when the route is naturally request/response, file-oriented, browser-oriented, or system-oriented.

Good fits:

- File upload, image parsing, binary payloads, and future binary or stream routes.
- Auth, session, cookie, CSRF, or redirect flows if they are added later.
- Health, readiness, metrics, or operational probes if they are added later.
- Browser routes, static assets, and client fallback routes.
- Feature commands or status routes where an HTTP verb and path are clearer than a GraphQL field.

Current Ocean Palette examples:

- Image upload and metadata parsing use REST through `packages/client/src/features/image/api.ts` and `packages/server/src/features/image/router.ts`.
- Live image config, status, directory browsing, sync, prompt, metadata, and delete routes use REST through `packages/client/src/features/live/api.ts` and `packages/server/src/features/live/router.ts`.
- Static image assets and browser client fallback stay in `packages/server/src/routes/assets.ts` and `packages/server/src/routes/client.ts`.

REST/HTTP does not mean every command must be REST. If a screen needs a typed aggregate read model, GraphQL may be the simpler boundary.

## 5. Client API import rule

Ocean Palette is already partly moved to feature-owned API modules.

Preferred import path for new client code:

- `~/features/category/api`
- `~/features/collection/api`
- `~/features/keyword/api`
- `~/features/image/api`
- `~/features/live/api`

Current compatibility exceptions:

- `packages/client/src/api/index.ts` still re-exports the public API surface for older callers.
- `packages/client/src/api/graphql.ts` still re-exports GraphQL feature APIs for compatibility.
- Feature GraphQL API files may import the shared request helper from `~/api/graphql-core`.
- Keep compatibility exports stable unless a separate PR removes old imports with a validation plan.

Review rule:

- New feature code should not add new `~/api` imports.
- Tests should mock the feature API module that the code imports, not a broader barrel, unless the test is specifically covering compatibility exports.

## 6. Server feature slice rule

Keep composition roots separate from feature internals.

Composition roots wire modules together and should stay thin:

- `packages/server/src/app.ts`
- `packages/server/src/routes/*`
- `packages/server/src/schema/index.ts`
- `packages/server/src/features/http-router.ts`
- `packages/server/src/urls.ts`

Feature internals own feature behavior and tests:

- HTTP controllers and routers live under `packages/server/src/features/<feature>/`.
- GraphQL type definitions and resolvers live under `packages/server/src/features/<feature>/graphql/`.
- Feature services, repositories, parsing helpers, and tests stay near the feature they serve.

Current Ocean Palette exception and direction:

- Some server feature files are still large, especially live image runtime and live HTTP controllers. Split them only by stable behavior boundaries, not by line count alone.
- Move private helpers first when refactoring. Keep exported names and route/schema composition stable unless the PR is explicitly about changing the public contract.

## 7. Repository boundary rule

Do not copy the `ocean-brain` structure into this repository.

Ocean Palette should keep rules that match its own current shape:

- Feature-owned client API modules are already the preferred direction here.
- Server feature slices are already the preferred direction here.
- Compatibility barrels still exist here and should be handled gradually.

Do not make all Ocean repositories identical. Shared ideas are allowed, but folder names, import rules, and migration timing must follow each repository's actual state.

## 8. Review checklist

Before approving an API boundary change, check:

- [ ] Did the PR explain the route or use-case before choosing GraphQL or REST/HTTP?
- [ ] If GraphQL was chosen, is it for a typed read model, aggregate screen data, or an existing GraphQL feature flow?
- [ ] If REST/HTTP was chosen, is it for file, auth/session, health/readiness, binary/stream, browser route, or a clearer HTTP command/status route?
- [ ] Are new client imports using feature API modules instead of adding new `~/api` imports?
- [ ] If a compatibility barrel changed, does the PR explain why and how it was validated?
- [ ] Are server composition roots still thin?
- [ ] Are feature internals kept inside the owning feature slice?
- [ ] Does the change avoid copying `ocean-brain` structure or forcing every repository into the same shape?
- [ ] Does the PR include focused validation for the changed boundary?
