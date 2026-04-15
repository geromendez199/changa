import {
  ArrowLeft,
  CreditCard,
  Shield,
  Lock,
  CheckCircle,
  Plus,
  Smartphone,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "../components/Badge";

export function Payments() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-8 max-w-md mx-auto font-['Inter']">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-[#111827]" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#111827]">Pagos seguros</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Métodos de pago y seguridad
            </p>
          </div>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="px-6 py-6">
        <div className="bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl flex-shrink-0">
                <Shield size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-xl mb-2">
                  Protección total
                </h2>
                <p className="text-white/90 text-sm leading-relaxed">
                  Tus pagos están encriptados y protegidos con tecnología de nivel bancario
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                <CheckCircle size={18} className="mb-2" />
                <p className="text-sm font-semibold">SSL seguro</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                <CheckCircle size={18} className="mb-2" />
                <p className="text-sm font-semibold">Anti fraude</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-[#111827] text-lg">Tus tarjetas</h2>
            <p className="text-sm text-gray-500 mt-0.5">Métodos de pago guardados</p>
          </div>
          <button className="text-[#10B981] text-sm font-semibold flex items-center gap-1.5 bg-green-50 px-4 py-2 rounded-full hover:bg-green-100 transition-colors">
            <Plus size={16} />
            Agregar
          </button>
        </div>

        <div className="space-y-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-white/80 text-sm mb-1">Tarjeta principal</p>
                  <Badge variant="success" icon={<CheckCircle size={10} />}>
                    Activa
                  </Badge>
                </div>
                <CreditCard size={32} className="text-white/80" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold tracking-wider">•••• 4242</p>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-white/80">Visa Débito</p>
                  <p className="font-semibold">12/26</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <p className="text-white/80 text-sm">Tarjeta secundaria</p>
                <CreditCard size={32} className="text-white/80" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold tracking-wider">•••• 8888</p>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-white/80">Mastercard</p>
                  <p className="font-semibold">08/25</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="px-6 mb-6">
        <div className="mb-4">
          <h2 className="font-bold text-[#111827] text-lg">Seguridad</h2>
          <p className="text-sm text-gray-500 mt-0.5">Cómo protegemos tu dinero</p>
        </div>

        <div className="bg-white rounded-3xl p-1 shadow-sm border border-gray-100">
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-2xl flex-shrink-0">
                <Lock size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#111827] mb-1 text-base">
                  Encriptación SSL
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Toda tu información está protegida con el mismo nivel de seguridad que usan los bancos
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-green-50 p-3 rounded-2xl flex-shrink-0">
                <Shield size={24} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#111827] mb-1 text-base">
                  Garantía de devolución
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Si algo sale mal con tu pago, te devolvemos el 100% sin hacer preguntas
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-purple-50 p-3 rounded-2xl flex-shrink-0">
                <Smartphone size={24} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#111827] mb-1 text-base">
                  Verificación 2FA
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Doble verificación en cada transacción para máxima seguridad
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="px-6">
        <div className="mb-4">
          <h2 className="font-bold text-[#111827] text-lg">Historial</h2>
          <p className="text-sm text-gray-500 mt-0.5">Tus últimas transacciones</p>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-[#111827] text-base mb-1">
                  Limpieza profunda
                </h3>
                <p className="text-sm text-gray-500">15 Abr, 2026 • 14:30hs</p>
              </div>
              <p className="font-bold text-[#111827] text-lg">$15.000</p>
            </div>
            <Badge variant="success" icon={<CheckCircle size={12} />}>
              Pagado
            </Badge>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-[#111827] text-base mb-1">
                  Arreglo de cañerías
                </h3>
                <p className="text-sm text-gray-500">10 Abr, 2026 • 09:15hs</p>
              </div>
              <p className="font-bold text-[#111827] text-lg">$12.000</p>
            </div>
            <Badge variant="success" icon={<CheckCircle size={12} />}>
              Pagado
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
