import { supabase } from './supabase';
export const getMessages = async (bookingId) => (await supabase.from('messages').select('*').eq('booking_id', bookingId).order('created_at', { ascending: true })).data || [];
export const sendMessage = (bookingId, senderId, content) => supabase.from('messages').insert({ booking_id: bookingId, sender_id: senderId, content }).select().single();
export const markMessagesAsRead = (bookingId, userId) => supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('booking_id', bookingId).neq('sender_id', userId).is('read_at', null);
export const subscribeToMessages = (bookingId, callback) => supabase.channel(`messages:${bookingId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${bookingId}` }, (payload) => callback(payload.new)).subscribe();
export const getUnreadCount = async (bookingId, userId) => (await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('booking_id', bookingId).neq('sender_id', userId).is('read_at', null)).count || 0;
