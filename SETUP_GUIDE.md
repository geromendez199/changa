# Changa Backend Setup Guide

## 1. Configure Environment Variables in Supabase Dashboard

Access: https://app.supabase.com → Project Settings → Edge Functions → Secrets

Add these secrets (used by Edge Functions):

```
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY
SENDGRID_API_KEY=SG.YOUR_SENDGRID_API_KEY
```

### How to get each:

**STRIPE_SECRET_KEY:**
- Go to https://dashboard.stripe.com/apikeys
- Copy the "Secret key" (starts with `sk_`)
- Keep this private, never commit it

**SENDGRID_API_KEY:**
- Go to https://app.sendgrid.com/settings/api_keys
- Create a new API Key with Mail Send permission
- Copy the generated key

## 2. Google Auth (Already Configured - No Cost!)

Google Auth is **free and already set up** in your Supabase project:

✅ OAuth provider: Enabled
✅ Login UI: Implemented in `src/app/screens/auth/Login.tsx`
✅ Service: `src/services/auth.service.ts` → `signInWithGoogle()`

**No additional setup needed.** Users can sign in with their Google account for free.

## 3. Edge Functions Integration (Already Ready)

All Edge Functions are deployed and ready:

- `payment-initiate` - Initiate Stripe payments
- `validate-review` - Create and validate reviews
- `send-notifications` - Send email notifications
- `log-event` - Log application events
- `verify-email` - Verify email OTP tokens

**Client library ready:** `src/lib/edge-functions.ts`

### Usage Example:

```typescript
import { initiatePayment, validateAndCreateReview, sendNotification } from '@/lib/edge-functions';

// Initiate payment
const payment = await initiatePayment({
  jobId: 'job-123',
  amount: 100,
  currency: 'USD',
});

// Create review
const review = await validateAndCreateReview({
  jobId: 'job-456',
  revieweeId: 'user-789',
  rating: 5,
  comment: 'Excellent work!',
});

// Send notification
await sendNotification({
  userId: 'user-123',
  type: 'review',
  title: 'Nueva reseña: 5⭐',
  body: 'Someone left you a review',
});
```

## 4. Frontend Integration Checklist

- [ ] Wire payment initiation in checkout flow (use `initiatePayment()`)
- [ ] Wire review submission in job completion (use `validateAndCreateReview()`)
- [ ] Wire notifications in real-time listeners (use `sendNotification()`)
- [ ] Test end-to-end payment flow with Stripe test mode
- [ ] Test email notifications with SendGrid test key

## 5. Local Development

Start local Supabase:
```bash
supabase start
```

Run frontend:
```bash
npm run dev
```

## 6. Production Deployment

The Edge Functions and database schema are deployed to production.

Next steps:
- Configure Stripe and SendGrid secrets in Supabase Dashboard
- Integrate Edge Functions in frontend workflows
- Test end-to-end with real payment processing
