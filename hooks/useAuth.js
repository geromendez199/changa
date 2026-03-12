import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Safe default context — prevents crashes when useAuth() is called outside provider
const defaultCtx = {
  user:          null,
  profile:       null,
  loading:       true,
  error:         null,
  signUp:        async () => ({ error: new Error('AuthProvider not mounted') }),
  signIn:        async () => ({ error: new Error('AuthProvider not mounted') }),
  signOut:       async () => {},
  updateProfile: async () => ({ error: new Error('AuthProvider not mounted') }),
  refetchProfile:async () => {},
};

const AuthContext = createContext(defaultCtx);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── fetchProfile: full try/catch/finally ─────────────────────────────────
  const fetchProfile = async (id) => {
    try {
      const { data, error: dbErr } = await supabase
        .from('profiles')
        // Only select what we actually use — avoids over-fetching
        .select('id, full_name, phone, bio, zone, avatar_url')
        .eq('id', id)
        .single();
      if (dbErr) throw dbErr;
      setProfile(data ?? null);
    } catch (e) {
      console.warn('[useAuth] fetchProfile failed:', e.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // .catch() prevents infinite loading spinner on network failure
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        else setLoading(false);
      })
      .catch((e) => {
        console.error('[useAuth] getSession failed:', e.message);
        setError(e.message);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, fullName) => {
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } },
      });
      return { error };
    } catch (e) {
      return { error: e };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
      return { error };
    } catch (e) {
      return { error: e };
    }
  };

  // signOut: error handled, no crash on failure
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('[useAuth] signOut failed:', e.message);
    }
  };

  // updateProfile: guard against null user
  const updateProfile = async (updates) => {
    if (!user?.id) return { error: new Error('No authenticated user') };
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (!error) setProfile(p => ({ ...p, ...updates }));
      return { error };
    } catch (e) {
      return { error: e };
    }
  };

  const refetchProfile = async () => {
    if (user?.id) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, error, signUp, signIn, signOut, updateProfile, refetchProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
