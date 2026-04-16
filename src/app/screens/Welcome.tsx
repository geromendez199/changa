/**
 * WHY: Make the first screen immediate and easy to understand with just the core brand and auth actions.
 * CHANGED: YYYY-MM-DD
 */
import { useNavigate } from "react-router";
import { BrandLogo } from "../components/BrandLogo";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="app-screen relative overflow-hidden bg-gradient-to-br from-[#0DAE79] via-[#0B9A6B] to-[#087A55] px-6 py-8">
      <div className="absolute right-0 top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-28 left-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="inline-flex min-h-28 min-w-72 items-center justify-center rounded-[2rem] border border-white/80 bg-white px-8 py-5 shadow-[0_18px_40px_rgba(8,122,85,0.18)]">
            <BrandLogo
              imageClassName="h-20 w-auto object-contain"
              fallbackClassName="text-4xl font-bold tracking-tight text-[#0DAE79]"
              alt="Changa"
            />
          </div>
          <div className="mt-10 w-full max-w-sm space-y-3">
            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-full bg-white px-6 py-4 text-base font-bold text-[var(--app-brand-strong)] shadow-[0_18px_40px_rgba(17,24,39,0.16)] transition-all duration-200 active:scale-[0.98]"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="w-full rounded-full border-2 border-white/80 bg-white/10 px-6 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 active:scale-[0.98]"
            >
              Crear cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
