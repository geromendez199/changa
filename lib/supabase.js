import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// These MUST be set in Vercel → Settings → Environment Variables
// Strict validation: App MUST crash loudly in dev/compilation if missing
const supabaseUrl     = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  throw new Error(
    "CRITICAL: Missing valid Supabase environment variables! " +
    "Please check your .env file or Vercel Environment Variables."
  );
}

// On web use localStorage, on native use AsyncStorage
const storage = Platform.OS === 'web'
  ? {
      getItem:    (key)        => Promise.resolve(localStorage.getItem(key)),
      setItem:    (key, value) => Promise.resolve(localStorage.setItem(key, value)),
      removeItem: (key)        => Promise.resolve(localStorage.removeItem(key)),
    }
  : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});
