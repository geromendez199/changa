# changa. 🟢
### La app de changas para Rafaela, Santa Fe

React Native · Expo SDK 54 · Supabase · iOS + Android

---

## Paso 1 — Instalar

```powershell
npm install --legacy-peer-deps
```

---

## Paso 2 — Configurar Supabase

1. Crear cuenta en https://supabase.com
2. **New Project** → nombre: `changa` → región: South America (São Paulo)
3. Ir a **SQL Editor** → New Query → pegar todo el contenido de `supabase-schema.sql` → **Run**
4. Ir a **Settings → API** → copiar **Project URL** y **anon public key**
5. Crear archivo `.env` en la raíz:

```
EXPO_PUBLIC_SUPABASE_URL=https://XXXXXXXX.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Paso 3 — Correr

```powershell
npx expo start --lan
```

Escanear el QR con la cámara del iPhone (o con Expo Go en Android).

---

## Funcionalidades

| Feature                        | Estado |
|-------------------------------|--------|
| Login y registro con email    | ✅     |
| Rutas protegidas              | ✅     |
| Ver servicios de prestadores  | ✅     |
| Filtrar por categoría         | ✅     |
| Contratar (pedido en DB)      | ✅     |
| Crear servicio (prestador)    | ✅     |
| Editar servicio               | ✅     |
| Borrar servicio               | ✅     |
| Pausar/activar servicio       | ✅     |
| Ver pedidos como cliente      | ✅     |
| Confirmar/rechazar pedidos    | ✅     |
| Editar perfil                 | ✅     |
| Cerrar sesión                 | ✅     |
| Pull-to-refresh               | ✅     |

---

## Estructura

```
changa/
├── app/
│   ├── (auth)/
│   │   ├── _layout.jsx
│   │   ├── login.jsx
│   │   └── register.jsx
│   ├── _layout.jsx      ← tabs + auth guard
│   ├── index.jsx        ← buscar y contratar
│   ├── pedidos.jsx      ← mis pedidos
│   ├── prestador.jsx    ← panel del prestador
│   └── perfil.jsx       ← mi perfil
├── components/
│   └── UI.jsx           ← componentes compartidos
├── hooks/
│   └── useAuth.js       ← contexto de autenticación
├── lib/
│   └── supabase.js      ← cliente Supabase
├── constants.js         ← colores y categorías
├── supabase-schema.sql  ← schema de la base de datos
└── .env.example
```

---

*Rafaela, Santa Fe, Argentina 🇦🇷*
