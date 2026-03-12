import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import * as auth from '../lib/auth';
const AuthContext = createContext({ user: null, profile: null, loading: true });
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [profile, setProfile] = useState(null); const [loading, setLoading] = useState(true);
  const fetchProfile = async (id) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    setProfile(data || null);
  };
  useEffect(() => {
    auth.getSession().then(async ({ data }) => { const u = data.session?.user || null; setUser(u); if (u) await fetchProfile(u.id); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => { const u = session?.user || null; setUser(u); if (u) await fetchProfile(u.id); else setProfile(null); setLoading(false); });
    return () => subscription.unsubscribe();
  }, []);
  const signIn = async (email, password) => { const r = await auth.signIn(email, password); if (!r.error && r.data?.user) await fetchProfile(r.data.user.id); return r; };
  const signUp = async ({ email, password, full_name, role }) => auth.signUp({ email, password, options: { data: { full_name, role } } });
  const signOut = auth.signOut;
  return <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refetchProfile: () => fetchProfile(user?.id) }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
