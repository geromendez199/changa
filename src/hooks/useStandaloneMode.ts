import { useEffect, useState } from "react";

function detectStandaloneMode() {
  if (typeof window === "undefined") return false;

  const mediaQueryMatch = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  const navigatorMatch =
    "standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return mediaQueryMatch || navigatorMatch;
}

export function useStandaloneMode() {
  const [isStandalone, setIsStandalone] = useState(detectStandaloneMode);

  useEffect(() => {
    const updateStandaloneMode = () => setIsStandalone(detectStandaloneMode());
    const mediaQuery = window.matchMedia?.("(display-mode: standalone)");

    updateStandaloneMode();

    mediaQuery?.addEventListener?.("change", updateStandaloneMode);
    window.addEventListener("visibilitychange", updateStandaloneMode);
    window.addEventListener("focus", updateStandaloneMode);

    return () => {
      mediaQuery?.removeEventListener?.("change", updateStandaloneMode);
      window.removeEventListener("visibilitychange", updateStandaloneMode);
      window.removeEventListener("focus", updateStandaloneMode);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.displayMode = isStandalone ? "standalone" : "browser";
    document.body.classList.toggle("app-standalone", isStandalone);

    return () => {
      document.documentElement.dataset.displayMode = "browser";
      document.body.classList.remove("app-standalone");
    };
  }, [isStandalone]);

  return isStandalone;
}
