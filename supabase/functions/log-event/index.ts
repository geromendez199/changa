import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.1';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

interface LogEvent {
  correlationId: string;
  eventType: string;
  severity: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

interface LogResponse {
  success: boolean;
  logId?: string;
  error?: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function logEvent(event: LogEvent): Promise<LogResponse> {
  try {
    const logId = uuidv4();

    const { error } = await supabase
      .from('activity_logs')
      .insert({
        id: logId,
        correlation_id: event.correlationId,
        event_type: event.eventType,
        severity: event.severity,
        message: event.message,
        user_id: event.userId || null,
        metadata: event.metadata || {},
        created_at: event.timestamp || new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to log event:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      logId,
    };
  } catch (error) {
    console.error('Log event processing error:', error);
    return {
      success: false,
      error: 'Internal server error',
    };
  }
}

// Also log to stdout for cloud logging systems (Sentry, Datadog, etc.)
function logToStdout(event: LogEvent): void {
  const logEntry = {
    timestamp: event.timestamp || new Date().toISOString(),
    correlationId: event.correlationId,
    eventType: event.eventType,
    severity: event.severity,
    message: event.message,
    userId: event.userId,
    metadata: event.metadata,
  };

  console.log(JSON.stringify(logEntry));
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const event = await req.json() as LogEvent;

    // Validate required fields
    if (!event.correlationId || !event.eventType || !event.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Log to both database and stdout
    const result = await logEvent(event);
    logToStdout(event);

    return new Response(JSON.stringify(result), {
      status: result.success ? 201 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Request processing error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
