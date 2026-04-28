import { initSentry } from "./observability/sentry";
import { initPostHog } from "./observability/posthog";

/**
 * Initialize all observability stacks (Sentry, PostHog, Vercel Analytics, Plausible)
 * Env-gated: only fires if env vars are configured
 * Runs after first paint to keep TTI fast
 */
export async function initObservability() {
  if (typeof window === "undefined") return;

  const start = async () => {
    try {
      await Promise.all([initSentry(), initPostHog()]);
      // Vercel Analytics + Speed Insights are imported in App.tsx as React components
      // Plausible is loaded via script tag in index.html (if configured)
    } catch (error) {
      console.error("[Observability] Initialization error:", error);
    }
  };

  // Schedule after first paint
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(start, { timeout: 2000 });
  } else {
    setTimeout(start, 1);
  }
}

export * from "./observability/sentry";
export * from "./observability/posthog";
