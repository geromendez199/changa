<!--
WHY: Document the Phase 3 refactor scope so future passes can trace what changed across schema, services, hooks, and project tooling.
CHANGED: YYYY-MM-DD
-->
# Changelog

## 2026-04-16 - Phase 3A and 3B refactor pass

### Architecture and state management
- Refactored `/src/app/hooks/useAppState.tsx` into a thin composition layer and moved domain state into dedicated hooks:
  - `/src/hooks/useJobsState.ts`
  - `/src/hooks/useProfileState.ts`
  - `/src/hooks/useChatState.ts`
  - `/src/hooks/usePaymentsState.ts`
  - `/src/hooks/useNotificationsState.ts`
  - `/src/hooks/useLocationState.ts`
- Preserved the public `useAppState()` contract for existing screen components.
- Consolidated canonical domain typing in `/src/types/domain.ts`.
- Removed deprecated duplicate type file `/src/app/types/domain.ts`.

### Validation and client boundary hardening
- Added shared validation utilities:
  - `/src/lib/validation/errors.ts`
  - `/src/lib/validation/schemas.ts`
- Applied validation before Supabase calls in:
  - `/src/services/auth.service.ts`
  - `/src/services/chat.service.ts`
  - `/src/services/jobs.service.ts`
  - `/src/services/profiles.service.ts`
- Updated `/package.json` to include `zod` for shared schema validation.

### Reliability and database changes
- Updated `/supabase-schema.sql` with Phase 3 performance indexes.
- Added generated full-text search column `jobs.search_document` and its GIN index.
- Added `send_message(...)` SQL function to make message creation plus conversation timestamp update atomic.
- Updated `/src/services/chat.service.ts` to send chat messages through `supabase.rpc("send_message")`.
- Updated `/src/services/jobs.service.ts` to replace `ilike` search with indexed full-text search.

### DX and local tooling
- Updated `/package.json` scripts for `lint`, `typecheck`, `format`, `test`, `test:watch`, and `check`.
- Added root config files:
  - `/.eslintrc.cjs`
  - `/.prettierrc`
  - `/tsconfig.json`
- Rewrote `/README.md` to reflect the real architecture: React SPA + direct Supabase access + incremental Edge Function boundary.
- Expanded `/.env.example` with documented environment variables.

### Runtime configuration and fallback behavior
- Updated `/src/lib/supabase.ts` to throw on missing Supabase env vars in production instead of silently falling back.
- Updated `/src/services/service.utils.ts` to centralize fallback mode semantics and validation-aware error normalization.

### Cleanup and removals
- Removed unused `/src/hooks/useAuthSession.ts`.
- Removed unused `/src/app/data/mockData.ts`.
- Aligned package identity in `/package.json` with the actual product name: `changa`.

