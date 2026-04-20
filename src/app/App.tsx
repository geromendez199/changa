import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppStateProvider } from "./hooks/useAppState";
import { AuthProvider } from "../context/AuthContext";
import { AppToaster } from "./components/AppToaster";
import { useStandaloneMode } from "../hooks/useStandaloneMode";

export default function App() {
  useStandaloneMode();

  return (
    <AuthProvider>
      <AppStateProvider>
        <RouterProvider router={router} />
        <AppToaster />
      </AppStateProvider>
    </AuthProvider>
  );
}
