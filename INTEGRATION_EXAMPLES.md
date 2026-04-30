# Edge Functions Integration Examples

This document shows how to integrate the deployed Edge Functions into your frontend workflows.

## Payment Integration

### Location: Job Completion / Payment Flow

```typescript
// src/app/screens/JobCheckout.tsx (example)
import { initiatePayment, logPaymentInitiated } from '@/lib/edge-functions';

async function handlePayment(jobId: string, amount: number) {
  const correlationId = uuidv4();
  
  try {
    // Initiate payment
    const payment = await initiatePayment({
      jobId,
      amount,
      currency: 'USD',
      correlationId,
    });

    // Log the event
    await logPaymentInitiated(jobId, amount, correlationId);

    // Open Stripe payment dialog with client_secret
    const response = await stripe.confirmPayment({
      clientSecret: payment.client_secret,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (response.error) {
      console.error('Payment failed:', response.error);
      return { ok: false, message: response.error.message };
    }

    return { ok: true, message: 'Payment successful!' };
  } catch (error) {
    await logError('Payment initiation failed', error, userId, correlationId);
    return { ok: false, message: 'Payment failed' };
  }
}
```

## Review Integration

### Location: Job Complete / Review Submission

```typescript
// src/app/screens/JobReview.tsx (example)
import { validateAndCreateReview, notifyReviewCreated, logReviewCreated } from '@/lib/edge-functions';

async function submitReview(
  jobId: string,
  revieweeId: string,
  rating: number,
  comment: string
) {
  const correlationId = uuidv4();

  try {
    // Validate and create review
    const review = await validateAndCreateReview({
      jobId,
      revieweeId,
      rating,
      comment,
      correlationId,
    });

    // Log the review creation
    await logReviewCreated(review.id, rating, revieweeId, correlationId);

    // Notify the reviewee
    const reviewerName = useAuth().user?.user_metadata?.name || 'Someone';
    await notifyReviewCreated(revieweeId, reviewerName, rating, correlationId);

    return { ok: true, reviewId: review.id };
  } catch (error) {
    // Handle validation errors
    if (error.message.includes('validation')) {
      return { ok: false, message: 'Invalid review data' };
    }
    // Handle other errors
    await logError('Review submission failed', error, userId, correlationId);
    throw error;
  }
}
```

## Notification Integration

### Location: Real-time Chat / Messages

```typescript
// src/hooks/useConversationListener.ts (example)
import { notifyNewMessage } from '@/lib/edge-functions';

export function useConversationListener(conversationId: string) {
  useEffect(() => {
    // Subscribe to new messages
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const message = payload.new as Message;

          // Only notify if user is not the sender
          if (message.sender_id !== currentUserId) {
            const sender = await getUser(message.sender_id);
            
            await notifyNewMessage(
              currentUserId,
              sender.full_name,
              message.content,
              conversationId
            );
          }
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [conversationId]);
}
```

### Location: Job Status Updates

```typescript
// src/services/jobs.service.ts (example)
import { notifyJobUpdate } from '@/lib/edge-functions';

export async function updateJobStatus(jobId: string, status: string) {
  const { data: job, error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)
    .select()
    .single();

  if (error) throw error;

  // Notify job owner
  await notifyJobUpdate(
    job.client_id,
    job.title,
    `Job status updated to: ${status}`,
    jobId
  );

  return job;
}
```

## Error Logging Integration

### Location: Global Error Boundary

```typescript
// src/context/ErrorContext.tsx (example)
import { logError, logEvent } from '@/lib/edge-functions';

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={async (error, errorInfo) => {
        const userId = useAuth().user?.id;
        
        // Log the error with correlation ID
        await logError(
          `React Error: ${error.message}`,
          error,
          userId
        );

        // Log additional context
        await logEvent({
          eventType: 'error_boundary',
          severity: 'error',
          message: `Component error: ${errorInfo.componentStack}`,
          userId,
        });

        // Show error UI
        setShowError(true);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### Location: API Error Handling

```typescript
// src/lib/api.ts (example)
import { logError } from '@/lib/edge-functions';

export async function apiCall<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      
      await logError(
        `API Error: ${url}`,
        error,
        getCurrentUserId()
      );
      
      throw error;
    }

    return response.json();
  } catch (error) {
    await logError(
      `API Call Failed: ${url}`,
      error,
      getCurrentUserId()
    );
    throw error;
  }
}
```

## Usage Patterns

### Correlation ID for End-to-End Tracing

Use correlation IDs to track a user action across multiple Edge Functions:

```typescript
const correlationId = uuidv4();

// Payment flow
const payment = await initiatePayment({
  jobId,
  amount,
  correlationId, // Same ID across all calls
});

await logPaymentInitiated(jobId, amount, correlationId);

// In logs, you can now find all events with this ID:
// [abc-123-def] initiatePayment called
// [abc-123-def] Payment record created
// [abc-123-def] Stripe intent created
// [abc-123-def] Edge Function completed
```

### Error Handling Patterns

```typescript
try {
  const review = await validateAndCreateReview({
    jobId,
    revieweeId,
    rating,
    comment,
  });
} catch (error) {
  // Edge Function validation errors (from validate-review)
  if (error.message.includes('rating must be')) {
    showToast('Rating must be between 1-5');
  } else if (error.message.includes('already reviewed')) {
    showToast('You already reviewed this job');
  } else {
    // Unexpected error
    await logError('Review validation failed', error);
    showToast('An error occurred');
  }
}
```

## Testing Edge Functions Locally

```bash
# Start local Supabase
supabase start

# Run your app
npm run dev

# Edge Functions are available at:
# http://localhost:54321/functions/v1/payment-initiate
# http://localhost:54321/functions/v1/validate-review
# http://localhost:54321/functions/v1/send-notifications
# http://localhost:54321/functions/v1/log-event
# http://localhost:54321/functions/v1/verify-email

# Test with curl:
curl -X POST http://localhost:54321/functions/v1/log-event \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "test",
    "severity": "info",
    "message": "Test event"
  }'
```

## Deployment Status

✅ All Edge Functions are deployed to production
✅ Edge Functions client library is ready (`src/lib/edge-functions.ts`)
✅ Supabase Auth is configured
✅ Database schema is in place

Next steps:
1. Configure STRIPE_SECRET_KEY and SENDGRID_API_KEY in Supabase Dashboard
2. Wire these integration examples into your frontend components
3. Test end-to-end flows (payment, review, notifications)
4. Monitor logs via Supabase Dashboard or using the log-event Edge Function
