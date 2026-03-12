import { supabase } from './supabase';
export const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
export const signUp = (payload) => supabase.auth.signUp(payload);
export const signOut = () => supabase.auth.signOut();
export const resetPassword = (email) => supabase.auth.resetPasswordForEmail(email);
export const getSession = () => supabase.auth.getSession();
