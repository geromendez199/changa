import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppStateProvider } from "./hooks/useAppState";
import { AuthProvider } from "../context/AuthContext";
import { AppToaster } from "./components/AppToaster";
import { useStandaloneMode } from "../hooks/useStandaloneMode";
import { usePageviewTracking } from "../hooks/usePageviewTracking";

export default function App() {
  useStandaloneMode();
  usePageviewTracking();

  return (
    <AuthProvider>
      <AppStateProvider>
        <RouterProvider router={router} />
        <AppToaster />
        <Analytics />
        <SpeedInsights />
      </AppStateProvider>
    </AuthProvider>
  );
}
