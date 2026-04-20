import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./app/App.tsx";
import "./styles/index.css";

registerSW({
  immediate: true,
  onRegistered(registration: ServiceWorkerRegistration | undefined) {
    if (import.meta.env.DEV) {
      console.info("[PWA] Service worker registrado", registration);
    }
  },
  onRegisterError(error: Error) {
    console.error("[PWA] No se pudo registrar el service worker", error);
  },
});

createRoot(document.getElementById("root")!).render(<App />);
