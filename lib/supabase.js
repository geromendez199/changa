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

// On web use localStorage with a safe in-memory fallback (Safari/private contexts can block it).
const webMemoryStorage = new Map();

const safeWebStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return Promise.resolve(window.localStorage.getItem(key));
      }
    } catch {
      // localStorage can throw in restricted contexts; fallback avoids auth crashes
    }
    return Promise.resolve(webMemoryStorage.get(key) ?? null);
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return Promise.resolve();
      }
    } catch {
      // localStorage can throw in restricted contexts; fallback avoids auth crashes
    }
    webMemoryStorage.set(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return Promise.resolve();
      }
    } catch {
      // localStorage can throw in restricted contexts; fallback avoids auth crashes
    }
    webMemoryStorage.delete(key);
    return Promise.resolve();
  },
};

const storage = Platform.OS === 'web' ? safeWebStorage : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});
