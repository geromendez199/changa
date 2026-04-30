import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.1';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

interface PaymentRequest {
  jobId: string;
  amount: number;
  currency: string;
  paymentMethodId?: string;
  correlationId?: string;
}

interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  clientSecret?: string;
  error?: string;
  correlationId: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initiatePayment(req: PaymentRequest): Promise<PaymentResponse> {
  const correlationId = req.correlationId || uuidv4();

  try {
    // Validate job exists and belongs to authenticated user
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, user_id, amount, status')
      .eq('id', req.jobId)
      .single();

    if (jobError || !job) {
      return {
        success: false,
        error: 'Job not found or access denied',
        correlationId,
      };
    }

    // Validate amount matches
    if (Math.abs(job.amount - req.amount) > 0.01) {
      return {
        success: false,
        error: 'Amount mismatch',
        correlationId,
      };
    }

    // Create payment record with pending status
    const paymentId = uuidv4();
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        id: paymentId,
        job_id: req.jobId,
        amount: req.amount,
        currency: req.currency,
        status: 'pending',
        created_at: new Date(),
        correlation_id: correlationId,
      });

    if (insertError) {
      return {
        success: false,
        error: `Failed to create payment record: ${insertError.message}`,
        correlationId,
      };
    }

    // Initialize Stripe payment intent
    const clientSecret = await initializeStripePayment(
      paymentId,
      req.amount,
      req.currency
    );

    if (!clientSecret) {
      return {
        success: false,
        error: 'Failed to initialize Stripe payment',
        correlationId,
      };
    }

    return {
      success: true,
      paymentId,
      clientSecret,
      correlationId,
    };
  } catch (error) {
    console.error(`[${correlationId}] Payment initiation error:`, error);
    return {
      success: false,
      error: 'Internal server error',
      correlationId,
    };
  }
}

async function initializeStripePayment(
  paymentId: string,
  amount: number,
  currency: string
): Promise<string | null> {
  try {
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100).toString(),
        currency,
        metadata: JSON.stringify({ paymentId }),
      }),
    });

    if (!response.ok) {
      throw new Error(`Stripe API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.client_secret || null;
  } catch (error) {
    console.error('Stripe payment initialization failed:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json() as PaymentRequest;
    const result = await initiatePayment(body);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const correlationId = uuidv4();
    console.error(`[${correlationId}] Request processing error:`, error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid request',
        correlationId,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});