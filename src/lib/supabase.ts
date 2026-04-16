/**
 * WHY: Fail fast in production when Supabase runtime configuration is missing while preserving local fallback mode.
 * CHANGED: YYYY-MM-DD
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);
const missingSupabaseEnvMessage =
  "[Supabase] Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY.";

if (!hasSupabaseEnv) {
  if (import.meta.env.PROD) {
    throw new Error(`${missingSupabaseEnvMessage} Production must not boot in fallback mode.`);
  }

  console.warn(`${missingSupabaseEnvMessage} Se usará modo fallback local.`);
}

export const supabase: SupabaseClient | null = hasSupabaseEnv
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const isSupabaseEnabled = hasSupabaseEnv;
