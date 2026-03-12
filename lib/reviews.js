import { supabase } from './supabase';
export const getReviewsByChangarin = async (changarinId) => (await supabase.from('reviews').select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)').eq('reviewed_id', changarinId).order('created_at', { ascending: false })).data || [];
export const createReview = (data) => supabase.from('reviews').insert(data).select().single();
export const hasReviewed = async (bookingId, reviewerId) => !!(await supabase.from('reviews').select('id').eq('booking_id', bookingId).eq('reviewer_id', reviewerId).maybeSingle()).data;
