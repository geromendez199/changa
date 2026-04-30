# Supabase Edge Functions

Este directorio contiene todas las Edge Functions para Changa, que corren en el servidor de Supabase.

## Funciones disponibles

### 1. `payment-initiate`
**Propósito**: Iniciar pagos de manera segura del lado del servidor
- Valida que el trabajo existe y pertenece al usuario
- Crea un registro de pago en la BD
- Integra con Stripe para obtener client_secret
- Retorna correlationId para trazabilidad

**Request**:
```json
{
  "jobId": "uuid",
  "amount": 150.00,
  "currency": "USD",
  "paymentMethodId": "pm_xxx", // optional
  "correlationId": "uuid" // optional, auto-generated if missing
}
```

**Response**:
```json
{
  "success": true,
  "paymentId": "uuid",
  "clientSecret": "pi_xxx",
  "correlationId": "uuid"
}
```

---

### 2. `validate-review`
**Propósito**: Validar y crear reviews de manera segura
- Verifica que el trabajo está completado
- Confirma participación del usuario
- Evita reviews duplicados
- Auto-actualiza ratings de usuario

**Request** (autenticado):
```json
{
  "jobId": "uuid",
  "revieweeId": "uuid",
  "rating": 5,
  "comment": "Great work! Highly recommended.",
  "correlationId": "uuid" // optional
}
```

**Response**:
```json
{
  "valid": true,
  "errors": [],
  "reviewId": "uuid",
  "correlationId": "uuid"
}
```

---

### 3. `send-notifications`
**Propósito**: Enviar notificaciones (in-app y email)
- Valida preferencias del usuario
- Almacena notificación en BD
- Envía email via SendGrid si está habilitado
- Mantiene correlation ID para trazas

**Request**:
```json
{
  "userId": "uuid",
  "type": "message|review|job_update|payment|chat",
  "title": "Nueva reseña",
  "body": "Juan te dejó una reseña de 5 estrellas",
  "data": {
    "reviewId": "uuid",
    "jobId": "uuid"
  },
  "correlationId": "uuid" // optional
}
```

**Response**:
```json
{
  "success": true,
  "notificationId": "uuid",
  "correlationId": "uuid"
}
```

---

### 4. `log-event`
**Propósito**: Registrar eventos estructurados para auditoría y debugging
- Almacena en tabla `activity_logs`
- También loguea a stdout (para Sentry/Datadog)
- Acepta metadata arbitraria

**Request**:
```json
{
  "correlationId": "uuid",
  "eventType": "payment_initiated|review_created|user_signup",
  "severity": "debug|info|warning|error",
  "message": "Payment initiated for job XYZ",
  "userId": "uuid", // optional
  "metadata": {
    "jobId": "uuid",
    "amount": 150.00
  },
  "timestamp": "2026-04-30T..." // optional, defaults to now()
}
```

**Response**:
```json
{
  "success": true,
  "logId": "uuid"
}
```

---

## Enviroment Variables Requeridas

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
STRIPE_SECRET_KEY=sk_xxx
SENDGRID_API_KEY=SG.xxx
```

## Correlation IDs para Trazabilidad

Todas las funciones soportan (y generan si es necesario) `correlationId` para trazabilidad end-to-end:

1. Cliente genera UUID único al iniciar operación
2. Lo envía a la Edge Function
3. La función lo propaga a BD, logs, y respuestas
4. Facilita debugging en logs de Sentry/Datadog

Ejemplo de trazado:
```
Client Request [correlation-id-123]
  → Edge Function [correlation-id-123]
    → DB logs [correlation-id-123]
      → Sentry [correlation-id-123]
```

## Desarrollo Local

Para probar localmente:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar Supabase local
supabase start

# Desplegar funciones
supabase functions deploy

# Ver logs
supabase functions list
supabase functions logs payment-initiate
```

## Deployar a Producción

```bash
# Set environment variables en Supabase Dashboard
# Settings → Edge Functions → Environment Variables

supabase functions deploy --project-id xxxxx
```

## RLS Policies

Cada tabla tiene RLS policies estrictas:
- `reviews`: Solo participantes del trabajo pueden crear/leer
- `conversations`: Solo participantes
- `messages`: Solo participantes y dentro del mismo conversation
- `payments`: Solo mediante Edge Function (insert/update bloqueados)

Ver [`migrations/20260430000000_rls_hardening.sql`](../migrations/20260430000000_rls_hardening.sql)

## Performance

### Materialized Views (mv_job_listings, mv_user_profiles)
Cachean datos frecuentemente consultados. Refresh cada 1 hora:
```sql
select refresh_materialized_views();
```

### Query Cache
Función `set_cache(key, value, ttl)` para caché custom:
```sql
select set_cache('jobs:trending', to_jsonb(jobs), 3600);
select get_cache('jobs:trending');
```

### Índices Críticos
Todos los índices necesarios ya están creados para:
- Full-text search (jobs.title + description)
- Filtering (status, category, location)
- Sorting (created_at, rating)

Ver [`migrations/20260430000003_query_optimization.sql`](../migrations/20260430000003_query_optimization.sql)
