# Changa Repository Audit (Pre-Launch)

## 1) Project architecture overview

### Tech stack
- **Frontend/App runtime:** React Native + Expo SDK 54 + Expo Router (`expo-router/entry`), with web support via React Native Web.  
- **Data/backend:** Supabase (Auth + Postgres + RLS), consumed directly from client with `@supabase/supabase-js`.  
- **State/data:** Local component state + `@tanstack/react-query` (`useInfiniteQuery`) for service feed pagination.  
- **Testing:** Jest + Testing Library for unit tests; one Playwright e2e file currently co-located with unit test discovery.  
- **Deployment/build:** Expo export for web, Vercel config for static hosting/rewrites/headers, EAS build config for mobile.

### Architecture map
- `app/_layout.jsx`: Root shell with auth guard + tab navigation + React Query provider + ErrorBoundary.
- `app/(auth)/`: Login/register screens.
- `app/index.jsx`: Marketplace search/filter + booking modal.
- `app/pedidos.jsx`: Booking list (client/worker tabs) + status transitions.
- `app/prestador.jsx`: Worker CRUD for services.
- `app/perfil.jsx`: Profile display/edit + logout.
- `hooks/useAuth.js`: Auth context/session/profile loading + profile updates.
- `hooks/useServices.js`: Infinite query for services list.
- `lib/supabase.js`: Supabase client and storage config.
- `supabase-schema.sql`: DB schema + trigger + RLS policies.

### Intended data flow
1. User signs up/in via Supabase Auth.
2. Trigger creates `profiles` row from `auth.users` metadata.
3. Auth context fetches profile and exposes user/profile actions.
4. Home screen reads active services with joined profile names.
5. User creates booking referencing client, worker, and service.
6. Worker manages services and booking status transitions.

---

## 2) Detected problems

### Critical runtime/config issues
1. **Jest config key is wrong** (`setupFilesAfterFramework` instead of `setupFilesAfterEnv`), causing warnings and missing proper setup.  
2. **Unit test imports missing dependency**: `@testing-library/react-hooks` is used but not installed.  
3. **Playwright e2e file runs under Jest** and fails because `@playwright/test` is not installed and no dedicated e2e runner config exists.
4. **ESLint script broken**: `.eslintrc.js` extends `expo` config but package `eslint-config-expo` is not installed.

### Functional/product issues
5. **Profile edit form stale state**: `perfil.jsx` initializes local form once from `profile`, but does not sync when async profile load completes.
6. **Booking status update lacks error handling** in `pedidos.jsx`; failures are silent and UI reload may show stale state.
7. **Service CRUD actions in `prestador.jsx` lack robust error handling** for delete/toggle.
8. **No server-enforced constraints for key business fields** (service `price` bounds, title length, etc.) in SQL schema.
9. **No loading/error fallback on auth route transitions beyond initial splash** (e.g., transient failures in `onAuthStateChange`/profile load can degrade UX).
10. **Input validation exists (`lib/validate.js`) but is not systematically wired across forms** (login/register/profile/booking/service forms mostly rely on minimal checks).

### Quality/maintainability issues
11. `WebLayout.jsx` appears unused (dead code candidate).
12. `PAGE_SIZE` constant duplicated (`hooks/useServices.js` and `app/index.jsx`), one unused in screen file.
13. Tests include an assertion using `getByTestId` for ActivityIndicator but component has no testID; the test passes only because value is never used.
14. Some comments/docs are optimistic vs real state (README marks all features complete, but reliability gaps remain).

---

## 3) Missing features

- **Robust auth lifecycle features:** password reset, email verification resend UX, session-expired handling in UI.
- **Booking lifecycle completeness:** client-side cancel flow, clearer completed/cancelled history filtering.
- **Operational features:** notifications (push/email) for booking state changes.
- **Moderation/admin controls:** abuse/reporting, service quality controls.
- **Profile completeness guardrails:** required minimum profile fields before publishing services.
- **Form UX standards:** consistent inline validation, disabled submit when invalid, field-specific errors.
- **Offline/poor-network strategy:** optimistic updates, retry controls, queueing for mutations.

---

## 4) Bug and security audit

### Security
- Good baseline with Supabase RLS enabled and scoped policies.
- Gaps:
  - `bookings` update policy allows both client and worker to update any field; app-level logic limits actions, but policy is broad. Use column-level or `WITH CHECK` constraints/RPC for strict transitions.
  - Missing DB constraints/sanitization increases risk of bad data and abuse (oversized text, unrealistic price, malformed categories).
  - CSP includes `'unsafe-inline'` + `'unsafe-eval'` (web hardening weak for production).

### Reliability bugs / crash risks
- Throwing hard error in `lib/supabase.js` when env is missing is explicit but can hard-crash local builds/tests unless env discipline is strict.
- `perfil.jsx` stale form state leads to accidental overwrite (empty fields saved over loaded data).
- Async mutation calls without try/catch in some action handlers can fail silently.

### Performance
- Home screen currently performs local filtering on all fetched pages; acceptable now but will degrade with large datasets.
- Missing query invalidation strategy for mutations; screens rely on manual reloads.

---

## 5) Production readiness issues

- **CI/CD missing:** no GitHub Actions/workflows for lint/test/build.
- **Lint/test not green by default** due to dependency/config mismatches.
- **No migration strategy** beyond one SQL file; lacks versioned migrations.
- **No seeds/dev fixtures** for predictable QA environments.
- **No observability wiring:** Sentry imported in ErrorBoundary but no init/config pipeline documented.
- **No rate limiting/abuse controls** for booking/service creation flows.
- **No structured logging strategy** (frontend logs only).
- **Env docs partially present**, but no startup validation matrix across dev/staging/prod.

---

## 6) Prioritized roadmap

### 1. CRITICAL (blocks app from running/releasing safely)
1. Fix Jest configuration key and split e2e from unit test execution.
2. Install/migrate missing test dependencies (`@testing-library/react-hooks` or replace with built-in renderHook from RN Testing Library if supported).
3. Fix ESLint config dependency (`eslint-config-expo`) and make lint pass.
4. Add CI workflow to enforce lint+tests on every PR.

### 2. HIGH PRIORITY (core functionality and reliability)
1. Sync profile form state with async profile load in `perfil.jsx`.
2. Add centralized form validation wiring using `lib/validate.js` across all write paths.
3. Harden mutation error handling in bookings/services actions with user-visible feedback.
4. Tighten DB constraints/policies for bookings status transitions and service field validation.
5. Add auth UX recovery flows (forgot password, verification guidance, session-expired banners).

### 3. MEDIUM PRIORITY (stability/scale)
1. Add query invalidation/mutation hooks using React Query for consistent cache updates.
2. Add pagination/search server-side filters for scalability.
3. Add telemetry: Sentry init + release/environment tagging.
4. Add seed scripts and local bootstrap command.

### 4. LOW PRIORITY (polish)
1. Accessibility sweep (focus states/keyboard traversal on web, labels/hints consistency).
2. Remove dead code and constants duplication.
3. Improve docs (architecture diagram + runbooks + troubleshooting).

---

## 7) Implementation steps with code examples

### A) Fix test/lint pipeline (Critical)

#### `package.json` (example)
```json
{
  "scripts": {
    "test": "jest --watchAll=false",
    "test:unit": "jest --watchAll=false --testPathIgnorePatterns=e2e",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext .js,.jsx"
  },
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterEnv": [
      "@testing-library/jest-native/extend-expect"
    ],
    "testPathIgnorePatterns": ["/node_modules/", "/e2e/"]
  },
  "devDependencies": {
    "eslint-config-expo": "^7.x",
    "@playwright/test": "^1.x",
    "@testing-library/react-hooks": "^8.x"
  }
}
```

### B) Prevent stale profile edit data (High)

#### `app/perfil.jsx` (example patch)
```jsx
import { useEffect, useState } from 'react';

useEffect(() => {
  if (!editing) {
    setForm({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      zone: profile?.zone || '',
    });
  }
}, [profile, editing]);
```

### C) Harden mutation handlers (High)

#### `app/pedidos.jsx` (example patch)
```jsx
const setStatus = (id, status) => {
  const labels = { confirmed: 'Confirmar', completed: 'Marcar completado', cancelled: 'Rechazar' };
  Alert.alert('Actualizar pedido', `¿${labels[status]}?`, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Sí',
      onPress: async () => {
        try {
          const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
          if (error) throw error;
          await load();
        } catch (e) {
          Alert.alert('Error', e.message || 'No se pudo actualizar el estado.');
        }
      },
    },
  ]);
};
```

### D) Add DB constraints and stricter policy (High)

#### migration SQL (example)
```sql
alter table public.services
  add constraint services_price_check check (price > 0 and price <= 999999),
  add constraint services_title_len check (char_length(title) between 3 and 120),
  add constraint services_category_allowed check (category in (
    'limpieza','plomeria','electricidad','pintura','jardineria','mudanza','computacion','otros'
  ));

-- optional: restrict booking status transitions via RPC instead of broad update policy
```

### E) Add CI workflow (Critical)

#### `.github/workflows/ci.yml` (example)
```yaml
name: ci
on: [push, pull_request]
jobs:
  app:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
```

---

## 8) Final recommended project structure

```txt
changa/
├── app/
├── components/
├── hooks/
├── lib/
├── db/
│   ├── migrations/
│   └── seeds/
├── e2e/
│   ├── playwright.config.ts
│   └── specs/
├── __tests__/
├── .github/
│   └── workflows/ci.yml
├── docs/
│   ├── architecture.md
│   ├── runbook.md
│   └── env.md
├── supabase/
│   └── config.toml
└── README.md
```

This target state gives:
- reliable local/dev/prod parity,
- enforceable quality gates,
- safer data model,
- complete core flows for real users,
- and a maintainable path to scale.
