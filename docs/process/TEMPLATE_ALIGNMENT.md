# Ocean Palette Template Alignment

Updated: 2026-04-26

This document records the local decisions for aligning Ocean Palette with
`/Users/baealex/GitHub/my-webapp-template`.

## Completed Alignment

- Node.js is pinned by `.nvmrc` to `22.22.2`.
- Root scripts expose `pnpm build`, `pnpm type-check`, and `pnpm check`.
- `pnpm check` runs `lint + type-check + build`.
- Lefthook pre-commit keeps the existing guardrails and runs `pnpm check`.
- CI reads Node.js from `.nvmrc`.
- Client tooling is aligned to Vite 8, `@vitejs/plugin-react` 6, Vitest 4, and Tailwind 4 through `@tailwindcss/vite`.
- Server Prisma is aligned to Prisma 7 with `prisma.config.ts` and `@prisma/adapter-better-sqlite3`.
- Server `app.ts` is thin composition; static client serving, GraphQL, assets, API routing, fallback handling, and error handling live in route/core modules.
- Client Dialog, DropdownMenu, Select, and Toast wrappers use `@baejino/react-ui` while keeping Ocean Palette's local visual variants.
- Repeated status colors are handled as UI variant classes instead of Tailwind semantic theme tokens.
- Collection query keys use object payloads, and broad collection invalidation is centralized in a domain helper with explicit `exact` intent.
- Server domain files are organized under `features/*`: GraphQL resolvers/tests, HTTP controllers/routers, live image services, image upload/metadata services, and user auth live beside their feature boundary.

## Intentional Exceptions

- Ocean Palette keeps `@tanstack/react-router` instead of moving to React Router 7 for now.
- The current router uses typed route search validation and nested route composition for gallery, detail, idea, load, auto-collect, and showcase flows.
- Replacing it with React Router 7 would be a route contract migration, not a tooling cleanup. Treat it as a separate product-level decision.

## Remaining Alignment Work

- No open template-alignment cleanup remains in the current scope.
- React Router 7 migration remains intentionally excluded as a product route-contract decision.
