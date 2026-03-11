import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// These MUST be set in Vercel → Settings → Environment Variables
// Fallback to a placeholder so the app renders (auth will fail but won't crash)
const supabaseUrl     = process.env.EXPO_PUBLIC_SUPABASE_URL     || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

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
