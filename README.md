# changa

App móvil de changas para Rafaela, Santa Fe (Expo + Supabase).

## Setup
1. Copiar `.env.example` a `.env.local` y completar `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
2. Instalar dependencias: `npm install`.
3. Correr: `npm run start`.
4. Correr tests: `npm run test:unit`.

## Estructura
- `app/`: rutas Expo Router por rol (`(auth)`, `(cliente)`, `(changarin)`).
- `components/ui`: design system reutilizable.
- `components/features`: tarjetas y bloques de negocio.
- `lib/`: capa de acceso a Supabase.
- `hooks/`: hooks de estado y realtime.
- `supabase-schema-v2.sql`: esquema completo con RLS y triggers.

## Base de datos
Ejecutar `supabase-schema-v2.sql` en Supabase SQL editor para crear tablas, políticas y funciones desde cero.

## Build
- `app.json` y `eas.json` preparados para EAS (development, preview apk, production).
