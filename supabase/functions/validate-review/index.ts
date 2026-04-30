import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.1';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

interface ReviewValidationRequest {
  jobId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  correlationId?: string;
}

interface ValidationResponse {
  valid: boolean;
  errors: string[];
  correlationId: string;
  reviewId?: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function validateReview(
  userId: string,
  req: ReviewValidationRequest
): Promise<ValidationResponse> {
  const correlationId = req.correlationId || uuidv4();
  const errors: string[] = [];

  try {
    // Validate rating
    if (req.rating < 1 || req.rating > 5 || !Number.isInteger(req.rating)) {
      errors.push('Rating must be an integer between 1 and 5');
    }

    // Validate comment length
    if (req.comment.length < 10 || req.comment.length > 500) {
      errors.push('Comment must be between 10 and 500 characters');
    }

    // Check if job exists and is completed
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, user_id, status, created_at')
      .eq('id', req.jobId)
      .single();

    if (jobError || !job) {
      errors.push('Job not found');
      return { valid: false, errors, correlationId };
    }

    if (job.status !== 'completed') {
      errors.push('Job must be completed before leaving a review');
    }

    // Verify reviewer participated in this job (either hired or was hired)
    const { data: participation } = await supabase
      .from('jobs')
      .select('user_id')
      .eq('id', req.jobId)
      .single();

    const isJobCreator = participation?.user_id === userId;
    const isReviewee = req.revieweeId !== userId;

    if (!isJobCreator && req.revieweeId !== participation?.user_id) {
      errors.push('User did not participate in this job');
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('job_id', req.jobId)
      .eq('reviewer_id', userId)
      .eq('reviewee_id', req.revieweeId)
      .single();

    if (existingReview) {
      errors.push('Review already exists for this job and user pair');
    }

    if (errors.length > 0) {
      return { valid: false, errors, correlationId };
    }

    // Create review record
    const reviewId = uuidv4();
    const { error: insertError } = await supabase
      .from('reviews')
      .insert({
        id: reviewId,
        job_id: req.jobId,
        reviewer_id: userId,
        reviewee_id: req.revieweeId,
        rating: req.rating,
        comment: req.comment,
        created_at: new Date(),
        correlation_id: correlationId,
      });

    if (insertError) {
      errors.push(`Failed to create review: ${insertError.message}`);
      return { valid: false, errors, correlationId };
    }

    // Update user rating if all reviews are inserted
    await updateUserRating(req.revieweeId);

    return {
      valid: true,
      errors: [],
      correlationId,
      reviewId,
    };
  } catch (error) {
    console.error(`[${correlationId}] Review validation error:`, error);
    return {
      valid: false,
      errors: ['Internal server error'],
      correlationId,
    };
  }
}

async function updateUserRating(userId: string): Promise<void> {
  try {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', userId);

    if (!reviews || reviews.length === 0) return;

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await supabase
      .from('profiles')
      .update({
        avg_rating: avgRating,
        review_count: reviews.length,
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Failed to update user rating:', error);
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
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify JWT and extract user ID
    const { data, error: authError } = await supabase.auth.getUser(token);

    if (authError || !data.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await req.json() as ReviewValidationRequest;
    const result = await validateReview(data.user.id, body);

    return new Response(JSON.stringify(result), {
      status: result.valid ? 201 : 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const correlationId = uuidv4();
    console.error(`[${correlationId}] Request processing error:`, error);
    return new Response(
      JSON.stringify({
        valid: false,
        errors: ['Invalid request'],
        correlationId,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});