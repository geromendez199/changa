import { ArrowLeft, MapPin, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { JobCard } from "../components/JobCard";
import { Input } from "../components/Input";

const categories = ["Todos", "Hogar", "Oficios", "Delivery", "Eventos"];

const jobs = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1611021061218-761c355ed331?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJwZW50ZXIlMjB3b3JraW5nJTIwd29vZHxlbnwxfHx8fDE3NzYxOTU4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Reparación de puerta de madera",
    description: "Se necesita reparar y barnizar puerta de entrada de madera maciza",
    category: "Carpintería",
    price: "$18.000",
    rating: 4.8,
    distance: "1.2 km",
    urgency: "Urgente",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGNsZWFuaW5nJTIwc2VydmljZXxlbnwxfHx8fDE3NzYyNTQ2NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Limpieza profunda completa",
    description: "Limpieza completa de departamento 2 ambientes con cocina y baño",
    category: "Limpieza",
    price: "$15.000",
    rating: 4.9,
    distance: "2.1 km",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1676210133055-eab6ef033ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmVyJTIwZml4aW5nJTIwcGlwZXN8ZW58MXx8fHwxNzc2MTk4NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Arreglo de cañerías urgente",
    description: "Pérdida importante en cañería del baño, se necesita reparar hoy",
    category: "Plomería",
    price: "$12.000",
    rating: 4.7,
    distance: "0.8 km",
    urgency: "Urgente",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1629941633816-a1d688cb2d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludGVyJTIwcGFpbnRpbmclMjB3YWxsfGVufDF8fHx8MTc3NjI1NDY3NHww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Pintura de habitaciones",
    description: "Pintar 2 habitaciones de 3x3m cada una con material incluido",
    category: "Pintura",
    price: "$20.000",
    rating: 4.6,
    distance: "1.5 km",
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1660330589693-99889d60181e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMHdvcmtpbmd8ZW58MXx8fHwxNzc2MjMxMTc2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Instalación eléctrica completa",
    description: "Cambio de todos los enchufes y instalación de luces LED",
    category: "Electricidad",
    price: "$14.000",
    rating: 4.8,
    distance: "2.5 km",
  },
];

export function SearchResults() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 max-w-md mx-auto font-['Inter']">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/home")}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-[#111827]" />
          </button>
          <div className="flex-1">
            <Input placeholder="Buscar servicios..." />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-2 flex-1 text-sm">
            <MapPin size={16} className="text-[#10B981]" />
            <span className="font-medium text-gray-700">Palermo, CABA</span>
          </div>
          <button className="flex items-center gap-2 bg-[#F8FAFC] px-4 py-2.5 rounded-full text-sm font-semibold text-[#111827] border border-gray-200 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={16} />
            Filtros
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-6 px-6">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                idx === 0
                  ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/25"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#111827] text-lg">
              48 resultados
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Ordenados por distancia
            </p>
          </div>
          <button className="text-sm text-[#10B981] font-semibold hover:underline">
            Ordenar
          </button>
        </div>
      </div>

      {/* Job listings */}
      <div className="px-6 space-y-3 pb-4">
        {jobs.map((job) => (
          <JobCard key={job.id} {...job} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
