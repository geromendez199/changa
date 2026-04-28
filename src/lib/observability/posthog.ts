import posthog from "posthog-js";

export async function initPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) {
    console.log("[Observability] PostHog key not configured, skipping");
    return;
  }

  try {
    const host = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";
    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false,
      autocapture: false,
    });
    console.log("[Observability] PostHog initialized");
  } catch (error) {
    console.error("[Observability] Failed to initialize PostHog:", error);
  }
}

export function identifyPostHogUser(userId: string, properties?: Record<string, unknown>) {
  if (!import.meta.env.VITE_POSTHOG_KEY) return;
  posthog.identify(userId, properties);
}

export function capturePostHogEvent(event: string, properties?: Record<string, unknown>) {
  if (!import.meta.env.VITE_POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

export function resetPostHog() {
  if (!import.meta.env.VITE_POSTHOG_KEY) return;
  posthog.reset();
}
