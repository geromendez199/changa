/**
 * WHY: Centralize error normalization and clearly define when local fallback mode is acceptable.
 * CHANGED: YYYY-MM-DD
 */
import { PostgrestError } from "@supabase/supabase-js";
import { isSupabaseEnabled, supabase } from "../lib/supabase";

export interface ServiceResult<T> {
  data: T;
  source: "supabase" | "fallback";
  error?: string;
}

export function successResult<T>(data: T, source: "supabase" | "fallback" = "supabase"): ServiceResult<T> {
  return { data, source };
}

export function failureResult<T>(data: T, error: string, source: "supabase" | "fallback" = "fallback"): ServiceResult<T> {
  return { data, source, error };
}

/*
 * Fallback mode means the SPA is running without a configured Supabase client.
 * It is acceptable for local development when a contributor wants to inspect UI flows
 * without provisioning a Supabase project yet.
 * It is not acceptable in production, where missing environment variables must stop boot.
 * UI code can detect fallback mode through the returned ServiceResult.source value and
 * surface a clear message instead of pretending production data loaded successfully.
 */
export const FALLBACK_MODE = !isSupabaseEnabled || !supabase;

export function normalizeError(error: unknown, fallbackMessage = "Error inesperado al consultar datos."): string {
  if (!error) return fallbackMessage;
  if (typeof error === "string") return error;

  const pgError = error as PostgrestError;
  if (pgError?.message) {
    if (pgError.message.includes("permission denied")) return "No tenés permisos para realizar esta acción.";
    if (pgError.message.includes("JWT")) return "Tu sesión expiró. Iniciá sesión nuevamente.";
    return pgError.message;
  }

  if (error instanceof Error) return error.message;
  return fallbackMessage;
}

export function shouldUseFallback() {
  return FALLBACK_MODE;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function toSafeNumber(value: unknown, fallback = 0): number {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export function toSafeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
