import { useEffect } from "react";
import { useLocation } from "react-router";
import { capturePostHogEvent } from "../lib/observability/posthog";

/**
 * Track page views on route change
 */
export function usePageviewTracking() {
  const location = useLocation();

  useEffect(() => {
    // Capture pageview with current URL
    capturePostHogEvent("$pageview", {
      $current_url: location.pathname + location.search,
    });
  }, [location.pathname, location.search]);
}
