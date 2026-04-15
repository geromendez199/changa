import { ArrowLeft, MapPin, Calendar, Star, Heart, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";

export function JobDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 max-w-md mx-auto font-['Inter']">
      {/* Image Header */}
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1611021061218-761c355ed331?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJwZW50ZXIlMjB3b3JraW5nJTIwd29vZHxlbnwxfHx8fDE3NzYxOTU4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Job"
          className="w-full h-[320px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-14 left-6 bg-white/95 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft size={20} className="text-[#111827]" />
        </button>
        
        <button className="absolute top-14 right-6 bg-white/95 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:bg-white transition-colors">
          <Heart size={20} className="text-[#111827]" />
        </button>

        <div className="absolute bottom-6 left-6">
          <Badge variant="default">Carpintería</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <h1 className="text-2xl font-bold text-[#111827] mb-3 leading-tight">
          Reparación de puerta de madera
        </h1>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <MapPin size={16} className="text-[#10B981]" />
              <span className="text-xs font-medium">Ubicación</span>
            </div>
            <p className="font-semibold text-[#111827] text-sm">Palermo, CABA</p>
            <p className="text-xs text-gray-500 mt-0.5">1.2 km de distancia</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar size={16} className="text-[#10B981]" />
              <span className="text-xs font-medium">Disponibilidad</span>
            </div>
            <p className="font-semibold text-[#111827] text-sm">Esta semana</p>
            <p className="text-xs text-gray-500 mt-0.5">Horario flexible</p>
          </div>
        </div>

        {/* Price Card */}
        <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-3xl p-6 mb-6 shadow-xl shadow-[#10B981]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Presupuesto</p>
              <p className="text-3xl font-bold text-white">$18.000</p>
              <p className="text-white/70 text-xs mt-1">Pago al finalizar</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
              <Shield size={32} className="text-white" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-3xl p-6 mb-6 border border-gray-100">
          <h2 className="font-bold text-[#111827] mb-3 flex items-center gap-2">
            <div className="w-1 h-5 bg-[#10B981] rounded-full"></div>
            Descripción
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Se necesita reparar y barnizar la puerta de entrada. La puerta está
            descascarada y necesita un trabajo de lijado completo y 2 capas de 
            barniz marino de alta calidad. Es una puerta estándar de 0.90m de ancho. 
            El trabajo se puede realizar en el lugar sin necesidad de desmontar la puerta.
          </p>
        </div>

        {/* Publisher Info */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-4 font-semibold">
            Publicado por
          </p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              M
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-[#111827]">Mariana G.</h3>
                <Badge variant="success" icon={<Shield size={10} />}>
                  Verificado
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-[#FBBF24] fill-[#FBBF24]" />
                  <span className="font-semibold text-gray-700">4.8</span>
                  <span className="text-gray-500">(23)</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <span className="text-gray-600">12 trabajos</span>
              </div>
            </div>
            <button className="text-[#10B981] font-semibold text-sm hover:underline">
              Ver perfil
            </button>
          </div>
        </div>

        {/* Trust signals */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-blue-50 rounded-2xl p-3 text-center border border-blue-100">
            <Shield size={20} className="text-blue-600 mx-auto mb-1" />
            <p className="text-xs font-semibold text-blue-700">Pago seguro</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-3 text-center border border-green-100">
            <Clock size={20} className="text-green-600 mx-auto mb-1" />
            <p className="text-xs font-semibold text-green-700">Garantía</p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-3 text-center border border-purple-100">
            <Star size={20} className="text-purple-600 mx-auto mb-1" />
            <p className="text-xs font-semibold text-purple-700">5★ Rating</p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-6 py-5 max-w-md mx-auto shadow-2xl">
        <div className="flex items-center gap-3">
          <button className="p-3 bg-[#F8FAFC] rounded-full border border-gray-200 hover:bg-gray-100 transition-colors flex-shrink-0">
            <Heart size={20} className="text-gray-600" />
          </button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
          >
            Me postulo
          </Button>
        </div>
      </div>
    </div>
  );
}
