/**
 * WHY: Align the first screen with the auth card layout so welcome, login, and signup feel like one cohesive flow.
 * CHANGED: YYYY-MM-DD
 */
import { useNavigate } from "react-router";
import { BrandLogo } from "../components/BrandLogo";
import { SurfaceCard } from "../components/SurfaceCard";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="app-screen flex items-center px-6 pt-12 pb-10">
      <SurfaceCard className="mx-auto w-full max-w-md" padding="lg">
        <div className="mb-8 flex justify-center">
          <div className="inline-flex min-h-24 items-center justify-center bg-white">
            <BrandLogo
              imageClassName="h-14 w-auto object-contain"
              fallbackClassName="text-4xl font-bold tracking-tight text-[#0DAE79]"
              alt="Changa"
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/login")}
            className="w-full rounded-full bg-[var(--app-brand)] px-6 py-4 text-base font-bold text-white shadow-[0_16px_32px_rgba(13,174,121,0.22)] transition-all duration-200 active:scale-[0.98]"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="w-full rounded-full border-2 border-[var(--app-brand)] bg-white px-6 py-4 text-base font-semibold text-[var(--app-brand)] transition-all duration-200 active:scale-[0.98]"
          >
            Crear cuenta
          </button>
        </div>
      </SurfaceCard>
    </div>
  );
}
