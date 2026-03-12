import { useCallback, useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../lib/profiles';
export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try { setProfile(await getProfile(userId)); } finally { setLoading(false); }
  }, [userId]);
  useEffect(() => { load(); }, [load]);
  const save = async (data) => { const { data: row } = await updateProfile(userId, data); setProfile(row); return row; };
  return { profile, loading, refresh: load, save };
}
