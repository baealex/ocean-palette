# Ocean Palette Query Key Convention

Updated: 2026-04-26

## 1. Scope
- Applies to all React Query `queryKey` and `invalidateQueries` usage in `packages/client`.

## 2. Required Rules
1. Generate all keys only from domain query key factories such as
   `packages/client/src/features/collection/query-keys.ts`.
2. Use `as const` tuple keys from factory functions.
3. Do not use nested array keys.
   - Disallowed: `queryKey: [collectionQueryKeys.modelOptions()]`
   - Allowed: `queryKey: collectionQueryKeys.modelOptions()`
4. Do not hardcode string array keys in component/hook/page files.
5. Use object-based params for key payloads (stable shape), not positional spread patterns like `Object.values(...)`.

## 3. Invalidate Strategy
- Use `exact: true` when invalidating one exact cache entry.
- Use `exact: false` when invalidating a key namespace/prefix.
- Prefix helpers such as `*.listRoot()` and `*.showcaseRoot()` must be used for broad invalidation.
- Domain invalidation helpers should live near the query key factory and include
  explicit `exact` intent for every invalidated key.

## 4. Invalidate Policy Map
| Domain | Trigger | Key | Match |
| --- | --- | --- | --- |
| Collections | live image sync/ingest | `collectionQueryKeys.listRoot()` | prefix |
| Collections | live image sync/ingest | `collectionQueryKeys.showcaseRoot()` | prefix |
| Collections | live image sync/ingest | `collectionQueryKeys.modelOptions()` | exact |
| Collections | current page refresh after edit/delete | active `collectionQueryKeys.list(...)` | exact |

## 5. Review Checklist
- No `queryKey: [` hardcoded arrays outside factory.
- No `Object.values` based key generation.
- No nested query keys.
- `invalidateQueries` includes explicit `exact` intent.
