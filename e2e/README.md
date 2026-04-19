# E2E con Playwright

Suite E2E para flujos reales de Changa.

## Requisitos

1. Instalar dependencias:

```bash
npm install
```

2. Instalar navegadores de Playwright:

```bash
npx playwright install --with-deps chromium
```

3. Crear `.env` desde `.env.example` y completar credenciales.

## Base URL

- Si `PLAYWRIGHT_BASE_URL` o `BASE_URL` están definidas, Playwright usa esa URL.
- Si no están definidas, Playwright levanta Vite localmente en `http://127.0.0.1:4173`.

## Comandos

```bash
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:smoke
npm run test:e2e:auth
npm run test:e2e -- --grep @core
npm run test:e2e:report
```

## Estructura

- `e2e/core-user-flows.spec.ts`: flujos core de usuario (home, navegación, login, logout, publish, búsqueda).
- `e2e/pages/`: page objects reutilizables.
- `e2e/support/`: helpers, auth/session setup y utilidades.


## Variables para flujos autenticados reales

El runner carga variables en este orden (sin pisar valores ya exportados):

1. `.env.e2e.local`
2. `.env.e2e`
3. `.env.local`
4. `.env`

Para forzar que la corrida falle (en vez de saltear auth bootstrap) cuando faltan credenciales, definir:

```bash
REQUIRE_AUTH_CREDENTIALS=1
```

Variables mínimas para validar auth real:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `TEST_EMAIL`
- `TEST_PASSWORD`

Opcional para segundo actor (prestador):

- `TEST_PROVIDER_EMAIL`
- `TEST_PROVIDER_PASSWORD`
