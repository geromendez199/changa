import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.1';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

interface NotificationPayload {
  userId: string;
  type: 'message' | 'review' | 'job_update' | 'payment' | 'chat';
  title: string;
  body: string;
  data?: Record<string, string>;
  correlationId?: string;
}

interface NotificationResponse {
  success: boolean;
  notificationId?: string;
  error?: string;
  correlationId: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function sendNotification(
  payload: NotificationPayload
): Promise<NotificationResponse> {
  const correlationId = payload.correlationId || uuidv4();

  try {
    // Get user profile with email and notification preferences
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, notification_preferences')
      .eq('id', payload.userId)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: 'User profile not found',
        correlationId,
      };
    }

    // Check notification preferences
    const prefs = profile.notification_preferences || {};
    if (!prefs[payload.type]) {
      return {
        success: true,
        error: undefined,
        correlationId,
      };
    }

    const notificationId = uuidv4();

    // Store notification in database
    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        id: notificationId,
        user_id: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        read: false,
        created_at: new Date(),
        correlation_id: correlationId,
      });

    if (insertError) {
      console.error(`[${correlationId}] Failed to store notification:`, insertError);
      return {
        success: false,
        error: 'Failed to store notification',
        correlationId,
      };
    }

    // Send email notification if enabled
    if (prefs.email_on_notification) {
      await sendEmailNotification(profile.email, payload, correlationId);
    }

    return {
      success: true,
      notificationId,
      correlationId,
    };
  } catch (error) {
    console.error(`[${correlationId}] Notification send error:`, error);
    return {
      success: false,
      error: 'Internal server error',
      correlationId,
    };
  }
}

async function sendEmailNotification(
  email: string,
  payload: NotificationPayload,
  correlationId: string
): Promise<void> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: 'notifications@changa.blog', name: 'Changa' },
        subject: payload.title,
        content: [
          {
            type: 'text/html',
            value: `<p>${payload.body}</p>`,
          },
        ],
        headers: {
          'X-Correlation-ID': correlationId,
        },
      }),
    });

    if (!response.ok) {
      console.warn(
        `[${correlationId}] SendGrid email send failed:`,
        response.statusText
      );
    }
  } catch (error) {
    console.error(`[${correlationId}] Email notification error:`, error);
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
    const payload = await req.json() as NotificationPayload;
    const result = await sendNotification(payload);

    return new Response(JSON.stringify(result), {
      status: result.success ? 201 : 400,
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
