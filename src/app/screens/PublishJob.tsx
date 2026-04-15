import { ArrowLeft, Home, Wrench, Truck, Calendar, Monitor, MoreHorizontal, Check } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Button } from "../components/Button";

const categories = [
  { icon: Home, label: "Hogar", color: "from-blue-500 to-blue-600", emoji: "🏡" },
  { icon: Wrench, label: "Oficio", color: "from-orange-500 to-orange-600", emoji: "🔧" },
  { icon: Truck, label: "Delivery", color: "from-purple-500 to-purple-600", emoji: "🚴" },
  { icon: Calendar, label: "Eventos", color: "from-pink-500 to-pink-600", emoji: "🎉" },
  { icon: Monitor, label: "Tecnología", color: "from-cyan-500 to-cyan-600", emoji: "💻" },
  { icon: MoreHorizontal, label: "Otros", color: "from-gray-500 to-gray-600", emoji: "✨" },
];

export function PublishJob() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 max-w-md mx-auto font-['Inter']">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-[#111827]" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#111827]">
              Publicá tu servicio
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Completá los datos en 3 pasos
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-[#10B981] rounded-full overflow-hidden">
              <div className="h-full bg-[#10B981] w-full"></div>
            </div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#10B981] font-semibold">Paso 1 de 3</span>
            <span className="text-gray-500">33% completado</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#111827] mb-2 leading-tight">
            ¿Qué tipo de servicio ofrecés?
          </h2>
          <p className="text-gray-600">
            Elegí la categoría que mejor describa tu trabajo
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(cat.label)}
              className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-200 ${
                selected === cat.label
                  ? "ring-4 ring-[#10B981] ring-offset-2 shadow-xl scale-[1.02]"
                  : "shadow-sm hover:shadow-lg border border-gray-100"
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-5`}
              ></div>
              <div className="relative z-10">
                <div
                  className={`bg-gradient-to-br ${cat.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg`}
                >
                  <span className="text-3xl">{cat.emoji}</span>
                </div>
                <p className="font-bold text-[#111827] text-center text-base">
                  {cat.label}
                </p>
              </div>
              {selected === cat.label && (
                <div className="absolute top-3 right-3 bg-[#10B981] text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Help text */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">💡 Consejo:</span> Elegí la categoría 
            más específica para que los clientes te encuentren más fácil
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-6 py-5 max-w-md mx-auto shadow-2xl">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selected}
        >
          Continuar
        </Button>
        {!selected && (
          <p className="text-center text-sm text-gray-500 mt-3">
            Seleccioná una categoría para continuar
          </p>
        )}
      </div>
    </div>
  );
}
