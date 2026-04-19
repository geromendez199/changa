export function getEnv(name: string, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

export function getBaseUrl() {
  return getEnv("PLAYWRIGHT_BASE_URL") || getEnv("BASE_URL") || "http://127.0.0.1:4173";
}

export function hasSupabaseRuntimeConfig() {
  return Boolean(getEnv("VITE_SUPABASE_URL") && getEnv("VITE_SUPABASE_ANON_KEY"));
}

export interface TestCredentials {
  email: string;
  password: string;
}

export function getUserCredentials(): TestCredentials | null {
  const email = getEnv("TEST_EMAIL");
  const password = getEnv("TEST_PASSWORD");

  if (!email || !password) return null;
  return { email, password };
}

export function getProviderCredentials(): TestCredentials | null {
  const providerEmail = getEnv("TEST_PROVIDER_EMAIL");
  const providerPassword = getEnv("TEST_PROVIDER_PASSWORD");

  if (providerEmail && providerPassword) {
    return { email: providerEmail, password: providerPassword };
  }

  return getUserCredentials();
}

export function hasClientCredentials() {
  return Boolean(getUserCredentials());
}

export function hasProviderCredentials() {
  return Boolean(getProviderCredentials());
}
