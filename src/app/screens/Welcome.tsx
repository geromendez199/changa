import { useNavigate } from "react-router";
import { BrandLogo } from "../components/BrandLogo";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0DAE79] via-[#0B9A6B] to-[#087A55] flex flex-col items-center justify-between px-6 py-12 max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center min-w-72 min-h-28 rounded-[2rem] px-8 py-5 bg-white border border-white/80 shadow-[0_18px_40px_rgba(8,122,85,0.18)]">
            <BrandLogo
              imageClassName="h-20 w-auto object-contain"
              fallbackClassName="text-4xl font-bold tracking-tight text-white"
              alt="Changa"
            />
          </div>
        </div>
      </div>

      <div className="w-full space-y-4 relative z-10">
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-white/10 backdrop-blur-sm border-2 border-white text-white py-4 px-6 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-200 active:scale-[0.98]"
        >
          Iniciar sesión
        </button>

        <button
          onClick={() => navigate("/signup")}
          className="w-full bg-white/5 backdrop-blur-sm border border-white/60 text-white py-3.5 px-6 rounded-full font-semibold text-base hover:bg-white/15 transition-all duration-200 active:scale-[0.98]"
        >
          Crear cuenta
        </button>
      </div>
    </div>
  );
}
