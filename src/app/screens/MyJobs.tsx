import { BottomNav } from "../components/BottomNav";
import { MapPin, Clock, CheckCircle, AlertCircle, Star } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/Badge";

const jobs = {
  active: [
    {
      id: "1",
      title: "Reparación de puerta de madera",
      image: "https://images.unsplash.com/photo-1611021061218-761c355ed331?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJwZW50ZXIlMjB3b3JraW5nJTIwd29vZHxlbnwxfHx8fDE3NzYxOTU4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "En progreso",
      statusType: "info" as const,
      date: "Hoy, 15:00hs",
      location: "Palermo, CABA",
      price: "$18.000",
    },
    {
      id: "2",
      title: "Limpieza profunda",
      image: "https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGNsZWFuaW5nJTIwc2VydmljZXxlbnwxfHx8fDE3NzYyNTQ2NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "Programado",
      statusType: "success" as const,
      date: "Mañana, 10:00hs",
      location: "Recoleta, CABA",
      price: "$15.000",
    },
  ],
  pending: [
    {
      id: "3",
      title: "Pintura de habitación",
      image: "https://images.unsplash.com/photo-1629941633816-a1d688cb2d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludGVyJTIwcGFpbnRpbmclMjB3YWxsfGVufDF8fHx8MTc3NjI1NDY3NHww&ixlib=rb-4.1.0&q=80&w=1080",
      status: "Esperando",
      statusType: "warning" as const,
      date: "23 Abr",
      location: "Belgrano, CABA",
      price: "$20.000",
    },
  ],
  completed: [
    {
      id: "4",
      title: "Arreglo de cañerías",
      image: "https://images.unsplash.com/photo-1676210133055-eab6ef033ce3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmVyJTIwZml4aW5nJTIwcGlwZXN8ZW58MXx8fHwxNzc2MTk4NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "Completado",
      statusType: "default" as const,
      date: "10 Abr",
      location: "Palermo, CABA",
      price: "$12.000",
      needsRating: true,
    },
    {
      id: "5",
      title: "Instalación eléctrica",
      image: "https://images.unsplash.com/photo-1660330589693-99889d60181e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMHdvcmtpbmd8ZW58MXx8fHwxNzc2MjMxMTc2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "Completado",
      statusType: "default" as const,
      date: "5 Abr",
      location: "Caballito, CABA",
      price: "$14.000",
      rated: true,
    },
  ],
};

export function MyJobs() {
  const [activeTab, setActiveTab] = useState<"active" | "pending" | "completed">(
    "active"
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 max-w-md mx-auto font-['Inter']">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827] mb-1">
            Mis trabajos
          </h1>
          <p className="text-sm text-gray-500">
            Gestiona tus trabajos activos y completados
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-[#F8FAFC] p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "active"
                ? "bg-white text-[#10B981] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Activos
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${
              activeTab === "active" ? "bg-[#10B981] text-white" : "bg-gray-200 text-gray-600"
            }`}>
              {jobs.active.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "pending"
                ? "bg-white text-[#10B981] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pendientes
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${
              activeTab === "pending" ? "bg-[#10B981] text-white" : "bg-gray-200 text-gray-600"
            }`}>
              {jobs.pending.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "completed"
                ? "bg-white text-[#10B981] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Hechos
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${
              activeTab === "completed" ? "bg-[#10B981] text-white" : "bg-gray-200 text-gray-600"
            }`}>
              {jobs.completed.length}
            </span>
          </button>
        </div>
      </div>

      {/* Job List */}
      <div className="px-6 py-6 space-y-3">
        {jobs[activeTab].map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex gap-4 p-4">
              <img
                src={job.image}
                alt={job.title}
                className="w-20 h-20 object-cover rounded-2xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#111827] mb-2 line-clamp-1 text-base">
                  {job.title}
                </h3>
                
                <Badge variant={job.statusType} icon={
                  job.statusType === "info" ? <AlertCircle size={12} /> :
                  job.statusType === "success" ? <Clock size={12} /> :
                  job.statusType === "default" ? <CheckCircle size={12} /> : undefined
                }>
                  {job.status}
                </Badge>

                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{job.date}</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right flex flex-col justify-between flex-shrink-0">
                <p className="text-[#10B981] font-bold text-base">{job.price}</p>
                {"needsRating" in job && job.needsRating && (
                  <button className="text-xs text-[#10B981] font-semibold bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors">
                    Calificar
                  </button>
                )}
                {"rated" in job && job.rated && (
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-[#FBBF24] fill-[#FBBF24]" />
                    <span className="text-xs text-gray-500">Calificado</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
