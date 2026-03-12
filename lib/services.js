import { supabase } from './supabase';
export const getServicesByChangarin = async (changarinId) => (await supabase.from('services').select('*').eq('changarin_id', changarinId).order('created_at', { ascending: false })).data || [];
export const getServicesByCategory = async (category) => {
  let q = supabase.from('services').select('*').eq('is_active', true);
  if (category) q = q.eq('category', category);
  const { data } = await q;
  return data || [];
};
export const createService = (data) => supabase.from('services').insert(data).select().single();
export const updateService = (id, data) => supabase.from('services').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single();
export const deleteService = (id) => supabase.from('services').delete().eq('id', id);
export const toggleServiceActive = (id, isActive) => supabase.from('services').update({ is_active: isActive }).eq('id', id);
