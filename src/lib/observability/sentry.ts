import * as Sentry from "@sentry/react";

export async function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.log("[Observability] Sentry DSN not configured, skipping");
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
    });
    console.log("[Observability] Sentry initialized");
  } catch (error) {
    console.error("[Observability] Failed to initialize Sentry:", error);
  }
}

export function setSentryUser(userId: string, email: string) {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.setUser({ id: userId, email });
}

export function clearSentryUser() {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.setUser(null);
}
