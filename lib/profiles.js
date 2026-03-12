import { supabase } from './supabase';
export const getProfile = async (id) => (await supabase.from('profiles').select('*').eq('id', id).single()).data;
export const updateProfile = (id, data) => supabase.from('profiles').update(data).eq('id', id).select().single();
export const getChangarines = async ({ category, search, sortBy } = {}) => {
  let q = supabase.from('profiles').select('*, services(*)').eq('role', 'changarin').eq('is_available', true);
  if (category) q = q.eq('category', category);
  if (search) q = q.ilike('full_name', `%${search}%`);
  if (sortBy === 'rating') q = q.order('rating', { ascending: false });
  if (sortBy === 'new') q = q.order('created_at', { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  if (sortBy === 'price') return [...(data || [])].sort((a, b) => ((a.services?.[0]?.price_from || 999999) - (b.services?.[0]?.price_from || 999999)));
  return data || [];
};
export const toggleAvailability = (id, isAvailable) => supabase.from('profiles').update({ is_available: isAvailable }).eq('id', id);
export const uploadAvatar = async (userId, imageUri) => {
  const ext = imageUri.split('.').pop() || 'jpg';
  const path = `${userId}/avatar.${ext}`;
  const res = await fetch(imageUri);
  const blob = await res.blob();
  const { error } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: `image/${ext}` });
  if (error) throw error;
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
};
export const pickAndUploadAvatar = async () => null;
