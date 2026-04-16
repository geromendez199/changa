<!--
WHY: Capture intentionally deferred work so the Phase 3 pass stays scoped while preserving the roadmap to a safer server-side boundary.
CHANGED: YYYY-MM-DD
-->
# Next Steps

## Deferred on purpose

### 1. Move auth-sensitive and payment-sensitive writes behind Supabase Edge Functions
- Why deferred: this pass focused on client-boundary validation, reliability, and state decomposition without changing the browser-visible data contract.
- Next move: introduce Edge Functions for payment initiation, privileged review creation checks, and any workflow that should not trust the browser.

### 2. Tighten RLS policies for reviews and conversations
- Why deferred: policy changes need a careful product pass to avoid blocking legitimate reads and writes in existing flows.
- Next move: restrict review inserts to users tied to a completed job and validate conversation participation more defensively around creation paths.

### 3. Add structured logging and correlation IDs
- Why deferred: the SPA currently lacks a shared telemetry sink, so adding correlation IDs end-to-end is more useful once Edge Functions exist.
- Next move: add a request ID generator in the client, propagate it through Edge Functions, and emit structured logs from server-side boundaries.

### 4. Finish test infrastructure with Vitest + MSW
- Why deferred: scripts and package scaffolding were added first, but full test config and verification are blocked in this environment because `node`/`npm` are unavailable.
- Next move: add `vitest.config.ts`, `src/test/setup.ts`, MSW handlers, and the first service-level integration tests for auth, jobs search, and chat send flows.

### 5. Verify the hook split with real typecheck and regression tests
- Why deferred: the split was completed statically, but it could not be validated locally with `npm run typecheck` or `npm run test`.
- Next move: run typecheck, fix any inferred return mismatches, and add regression coverage around `useAppState()` consumers.

### 6. Introduce server-side search and ranking only if browser-side PostgREST search becomes limiting
- Why deferred: full-text search is now indexed and substantially better, so a dedicated RPC is not yet required.
- Next move: add a ranked search RPC if relevance tuning, stemming, or analytics-driven weighting becomes necessary.

### 7. Persist avatars outside localStorage
- Why deferred: avatar persistence is still intentionally lightweight and local-only.
- Next move: move avatar upload metadata to Supabase Storage plus `profiles`-adjacent persistence without breaking current UI usage.
