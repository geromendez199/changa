import { Search, MapPin, Bell } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { JobCard } from "../components/JobCard";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";

const categories = [
  { label: "Todos", emoji: "🏠", active: true },
  { label: "Hogar", emoji: "🏡", active: false },
  { label: "Oficios", emoji: "🔧", active: false },
  { label: "Delivery", emoji: "🚴", active: false },
  { label: "Eventos", emoji: "🎉", active: false },
];

const featuredJobs = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1611021061218-761c355ed331?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJwZW50ZXIlMjB3b3JraW5nJTIwd29vZHxlbnwxfHx8fDE3NzYxOTU4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Reparación de puerta de madera",
    category: "Carpintería",
    price: "$18.000",
    rating: 4.8,
    distance: "1.2 km",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGNsZWFuaW5nJTIwc2VydmljZXxlbnwxfHx8fDE3NzYyNTQ2NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Limpieza profunda de departamento",
    category: "Limpieza",
    price: "$15.000",
    rating: 4.9,
    distance: "2.1 km",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1676210133055-eab6ef033ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmVyJTIwZml4aW5nJTIwcGlwZXN8ZW58MXx8fHwxNzc2MTk4NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Arreglo de cañerías",
    category: "Plomería",
    price: "$12.000",
    rating: 4.7,
    distance: "0.8 km",
    urgency: "Urgente",
  },
];

const nearbyJobs = [
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1629941633816-a1d688cb2d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludGVyJTIwcGFpbnRpbmclMjB3YWxsfGVufDF8fHx8MTc3NjI1NDY3NHww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Pintura de habitación completa",
    description: "Necesito pintar 2 habitaciones de aproximadamente 3x3m cada una",
    category: "Pintura",
    price: "$20.000",
    rating: 4.6,
    distance: "1.5 km",
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1561563239-a6d2bd5dda20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW5lciUyMHdvcmtpbmclMjBnYXJkZW58ZW58MXx8fHwxNzc2MjU0Njc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Jardinería y poda de plantas",
    description: "Mantenimiento de jardín, poda de árboles y plantas",
    category: "Jardinería",
    price: "$10.000",
    rating: 4.8,
    distance: "3.2 km",
  },
];

export function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 max-w-md mx-auto font-['Inter']">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">Bienvenido de nuevo</p>
            <h1 className="text-2xl font-bold text-[#111827]">
              Hola, Gero 👋
            </h1>
          </div>
          <button className="relative p-3 bg-[#F8FAFC] rounded-full hover:bg-gray-100 transition-colors">
            <Bell size={20} className="text-gray-600" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-[#10B981] rounded-full border-2 border-white"></div>
          </button>
        </div>

        {/* Search Bar */}
        <Input
          placeholder="Buscar servicios..."
          icon={<Search size={20} />}
        />

        {/* Location */}
        <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
          <MapPin size={16} className="text-[#10B981]" />
          <span className="font-medium">Palermo, CABA</span>
          <span className="text-gray-400">•</span>
          <button className="text-[#10B981] font-medium hover:underline">
            Cambiar
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 py-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all duration-200 ${
                cat.active
                  ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/25"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-lg">{cat.emoji}</span>
              <span className="font-semibold text-sm">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Jobs */}
      <div className="mb-8">
        <div className="px-6 mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#111827] text-lg mb-1">
              Destacados
            </h2>
            <p className="text-sm text-gray-500">Los mejores cerca tuyo</p>
          </div>
          <button className="text-[#10B981] text-sm font-semibold hover:underline">
            Ver todos
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 scrollbar-hide -mx-6">
          <div className="w-4 flex-shrink-0"></div>
          {featuredJobs.map((job) => (
            <JobCard key={job.id} {...job} featured />
          ))}
          <div className="w-4 flex-shrink-0"></div>
        </div>
      </div>

      {/* Nearby Jobs */}
      <div className="px-6">
        <div className="mb-5">
          <h2 className="font-bold text-[#111827] text-lg mb-1">
            Cerca de vos
          </h2>
          <p className="text-sm text-gray-500">48 trabajos disponibles</p>
        </div>
        <div className="space-y-3">
          {nearbyJobs.map((job) => (
            <JobCard key={job.id} {...job} />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
