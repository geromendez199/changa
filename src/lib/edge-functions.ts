import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';

export interface CorrelatedRequest {
  correlationId?: string;
}

export interface PaymentRequest extends CorrelatedRequest {
  jobId: string;
  amount: number;
  currency: string;
  paymentMethodId?: string;
}

export interface ReviewRequest extends CorrelatedRequest {
  jobId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}

export interface NotificationRequest extends CorrelatedRequest {
  userId: string;
  type: 'message' | 'review' | 'job_update' | 'payment' | 'chat';
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface LogEventRequest extends CorrelatedRequest {
  eventType: string;
  severity: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

const getCorrelationId = (provided?: string): string => provided || uuidv4();

async function callEdgeFunction<T>(
  functionName: string,
  payload: CorrelatedRequest,
  requiresAuth: boolean = true
): Promise<T> {
  const correlationId = getCorrelationId(payload.correlationId);

  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: {
        ...payload,
        correlationId,
      },
    });

    if (error) {
      console.error(`[${correlationId}] Edge function error:`, error);
      throw new Error(`${functionName} failed: ${error.message}`);
    }

    return { ...data, correlationId } as T;
  } catch (err) {
    console.error(`[${correlationId}] Edge function call failed:`, err);
    throw err;
  }
}

export async function initiatePayment(request: PaymentRequest) {
  const correlationId = getCorrelationId(request.correlationId);
  return callEdgeFunction('payment-initiate', {
    ...request,
    correlationId,
  });
}

export async function validateAndCreateReview(request: ReviewRequest) {
  const correlationId = getCorrelationId(request.correlationId);
  return callEdgeFunction('validate-review', {
    ...request,
    correlationId,
  }, true);
}

export async function sendNotification(request: NotificationRequest) {
  const correlationId = getCorrelationId(request.correlationId);
  return callEdgeFunction('send-notifications', {
    ...request,
    correlationId,
  });
}

export async function notifyReviewCreated(
  revieweeId: string,
  reviewerName: string,
  rating: number,
  correlationId?: string
) {
  return sendNotification({
    userId: revieweeId,
    type: 'review',
    title: `Nueva reseña: ${rating}⭐`,
    body: `${reviewerName} te dejó una reseña de ${rating} estrellas`,
    data: {
      rating: rating.toString(),
    },
    correlationId,
  });
}

export async function notifyNewMessage(
  recipientId: string,
  senderName: string,
  preview: string,
  conversationId: string,
  correlationId?: string
) {
  return sendNotification({
    userId: recipientId,
    type: 'message',
    title: `Nuevo mensaje de ${senderName}`,
    body: preview.substring(0, 50),
    data: {
      conversationId,
    },
    correlationId,
  });
}

export async function notifyJobUpdate(
  userId: string,
  jobTitle: string,
  update: string,
  jobId: string,
  correlationId?: string
) {
  return sendNotification({
    userId,
    type: 'job_update',
    title: `Actualización: ${jobTitle}`,
    body: update,
    data: {
      jobId,
    },
    correlationId,
  });
}

export async function logEvent(request: LogEventRequest) {
  const correlationId = getCorrelationId(request.correlationId);

  try {
    await callEdgeFunction('log-event', {
      ...request,
      correlationId,
    }, false);
  } catch (err) {
    console.warn('Failed to log event:', err);
  }

  const logLevel = request.severity.toUpperCase();
  console.log(`[${correlationId}] [${logLevel}] ${request.message}`, request.metadata);
}

export async function logPaymentInitiated(
  jobId: string,
  amount: number,
  correlationId?: string
) {
  return logEvent({
    eventType: 'payment_initiated',
    severity: 'info',
    message: `Payment initiated for job ${jobId}`,
    metadata: {
      jobId,
      amount,
    },
    correlationId,
  });
}

export async function logReviewCreated(
  reviewId: string,
  rating: number,
  revieweeId: string,
  correlationId?: string
) {
  return logEvent({
    eventType: 'review_created',
    severity: 'info',
    message: `Review created: ${rating} stars for user ${revieweeId}`,
    metadata: {
      reviewId,
      rating,
      revieweeId,
    },
    correlationId,
  });
}

export async function logError(
  message: string,
  error: unknown,
  userId?: string,
  correlationId?: string
) {
  return logEvent({
    eventType: 'error',
    severity: 'error',
    message,
    userId,
    metadata: {
      error: error instanceof Error ? error.message : String(error),
    },
    correlationId,
  });
}

export async function searchJobs(
  query: string = '',
  filters?: {
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    location?: string;
    limit?: number;
    offset?: number;
  }
) {
  const { data, error } = await supabase.rpc('search_jobs', {
    p_query: query,
    p_category: filters?.category || null,
    p_min_budget: filters?.minBudget || 0,
    p_max_budget: filters?.maxBudget || null,
    p_location: filters?.location || null,
    p_limit: filters?.limit || 20,
    p_offset: filters?.offset || 0,
  });

  if (error) throw error;
  return data;
}

export async function searchProfiles(
  query: string = '',
  filters?: {
    minRating?: number;
    skills?: string[];
    location?: string;
    limit?: number;
    offset?: number;
  }
) {
  const { data, error } = await supabase.rpc('search_profiles', {
    p_query: query,
    p_min_rating: filters?.minRating || 0,
    p_skills: filters?.skills || null,
    p_location: filters?.location || null,
    p_limit: filters?.limit || 20,
    p_offset: filters?.offset || 0,
  });

  if (error) throw error;
  return data;
}

export async function getJobRecommendations(
  userId: string,
  limit: number = 10
) {
  const { data, error } = await supabase.rpc('get_job_recommendations', {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) throw error;
  return data;
}

export async function getCached(key: string) {
  const { data, error } = await supabase.rpc('get_cache', {
    p_key: key,
  });

  if (error) console.warn('Cache get failed:', error);
  return data;
}

export async function setCached(
  key: string,
  value: Record<string, unknown>,
  ttlSeconds: number = 3600
) {
  const { error } = await supabase.rpc('set_cache', {
    p_key: key,
    p_value: value,
    p_ttl_seconds: ttlSeconds,
  });

  if (error) console.warn('Cache set failed:', error);
}

export async function invalidateCache(key: string) {
  const { error } = await supabase.rpc('invalidate_cache', {
    p_key: key,
  });

  if (error) console.warn('Cache invalidate failed:', error);
}
