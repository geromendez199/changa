import { BottomNav } from "../components/BottomNav";
import {
  Star,
  Briefcase,
  Shield,
  CreditCard,
  Settings,
  ChevronRight,
  Award,
  TrendingUp,
  Bell,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "../components/Badge";

export function Profile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 max-w-md mx-auto font-['Inter']">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] px-6 pt-14 pb-24 rounded-b-[48px] relative overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <button className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
              <Settings size={20} className="text-white" />
            </button>
            <button className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
              <Bell size={20} className="text-white" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-[#10B981] font-bold text-3xl mb-4 shadow-2xl">
              G
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Gero M.</h1>
            <p className="text-white/80 text-sm">Miembro desde Marzo 2024</p>
            <div className="mt-4">
              <Badge variant="success" icon={<Shield size={12} />}>
                Verificado
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 -mt-16 mb-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-yellow-50 p-2 rounded-xl">
                  <Star size={20} className="text-[#FBBF24]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#111827] mb-0.5">4.8</p>
              <p className="text-xs text-gray-500 font-medium">Rating</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-green-50 p-2 rounded-xl">
                  <Briefcase size={20} className="text-[#10B981]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#111827] mb-0.5">24</p>
              <p className="text-xs text-gray-500 font-medium">Trabajos</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-blue-50 p-2 rounded-xl">
                  <TrendingUp size={20} className="text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#111827] mb-0.5">98%</p>
              <p className="text-xs text-gray-500 font-medium">Éxito</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Badge */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-5 border border-blue-100 flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-2xl shadow-lg flex-shrink-0">
            <Award size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#111827] mb-0.5">Usuario destacado</h3>
            <p className="text-sm text-gray-600">
              Top 10% este mes
            </p>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </div>
      </div>

      {/* Menu Options */}
      <div className="px-6 space-y-3 mb-6">
        <button
          onClick={() => navigate("/payments")}
          className="w-full bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:shadow-lg transition-all duration-200 border border-gray-100"
        >
          <div className="bg-green-50 p-3 rounded-2xl">
            <CreditCard size={24} className="text-[#10B981]" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-[#111827] text-base">Pagos</h3>
            <p className="text-sm text-gray-500">Métodos y facturas</p>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        <button className="w-full bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:shadow-lg transition-all duration-200 border border-gray-100">
          <div className="bg-gray-50 p-3 rounded-2xl">
            <Settings size={24} className="text-gray-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-[#111827] text-base">Configuración</h3>
            <p className="text-sm text-gray-500">Preferencias y privacidad</p>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Reviews Section */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-[#111827] text-lg">Reseñas</h2>
            <p className="text-sm text-gray-500">Últimas calificaciones</p>
          </div>
          <button className="text-[#10B981] text-sm font-semibold hover:underline">
            Ver todas
          </button>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <h3 className="font-bold text-[#111827] text-sm">Mariana G.</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className="text-[#FBBF24] fill-[#FBBF24]"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-500">Hace 2 días</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Excelente trabajo, muy prolijo y cumplidor. Lo recomiendo totalmente!
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center text-white font-bold">
                  C
                </div>
                <div>
                  <h3 className="font-bold text-[#111827] text-sm">Carlos R.</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[...Array(4)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className="text-[#FBBF24] fill-[#FBBF24]"
                      />
                    ))}
                    <Star size={12} className="text-gray-300" />
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-500">1 semana</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Muy buen servicio, llegó puntual y dejó todo impecable.
            </p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-6 mt-8 mb-4">
        <button className="w-full text-red-600 font-semibold text-sm py-3 flex items-center justify-center gap-2 hover:bg-red-50 rounded-2xl transition-colors">
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
