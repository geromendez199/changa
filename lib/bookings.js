import { supabase } from './supabase';
export const createBooking = (data) => supabase.from('bookings').insert(data).select().single();
export const getBookingById = async (id) => (await supabase.from('bookings').select('*, cliente:profiles!bookings_cliente_id_fkey(*), changarin:profiles!bookings_changarin_id_fkey(*), service:services(*)').eq('id', id).single()).data;
export const getBookingsByCliente = async (clienteId) => (await supabase.from('bookings').select('*, changarin:profiles!bookings_changarin_id_fkey(*), service:services(*)').eq('cliente_id', clienteId).order('created_at', { ascending: false })).data || [];
export const getBookingsByChangarin = async (changarinId) => (await supabase.from('bookings').select('*, cliente:profiles!bookings_cliente_id_fkey(*), service:services(*)').eq('changarin_id', changarinId).order('created_at', { ascending: false })).data || [];
export const updateBookingStatus = (id, status) => supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
export const getActiveBooking = async (userId) => (await supabase.from('bookings').select('*').or(`cliente_id.eq.${userId},changarin_id.eq.${userId}`).in('status', ['pending', 'accepted', 'in_progress']).order('created_at', { ascending: false }).limit(1).maybeSingle()).data;
