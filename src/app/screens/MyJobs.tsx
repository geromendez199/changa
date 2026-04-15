import { BottomNav } from "../components/BottomNav";
import { MapPin, Clock, CheckCircle, AlertCircle, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/Badge";
import { useAppState } from "../hooks/useAppState";

export function MyJobs() {
  const { jobs, applications, currentUserId, updateApplicationStatus } = useAppState();
  const [activeTab, setActiveTab] = useState<"publicados" | "postulados" | "completados">("publicados");

  const postedJobs = useMemo(() => jobs.filter((job) => job.postedByUserId === currentUserId), [currentUserId, jobs]);
  const appliedRows = useMemo(
    () => applications.map((application) => ({ application, job: jobs.find((j) => j.id === application.jobId) })).filter((item) => item.job),
    [applications, jobs],
  );
  const completed = useMemo(() => jobs.filter((job) => job.status === "completado"), [jobs]);

  const tabData = {
    publicados: postedJobs,
    postulados: appliedRows,
    completados: completed,
  } as const;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 max-w-md mx-auto font-['Inter']">
      <div className="bg-white px-6 pt-14 pb-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827] mb-1">Mis trabajos</h1>
          <p className="text-sm text-gray-500">Gestioná tus publicaciones y postulaciones</p>
        </div>

        <div className="flex gap-2 bg-[#F8FAFC] p-1 rounded-2xl">
          {(
            [
              ["publicados", "Publicados", postedJobs.length],
              ["postulados", "Postulados", appliedRows.length],
              ["completados", "Hechos", completed.length],
            ] as const
          ).map(([key, label, count]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === key ? "bg-white text-[#10B981] shadow-sm" : "text-gray-600"}`}>
              {label}
              <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${activeTab === key ? "bg-[#10B981] text-white" : "bg-gray-200 text-gray-600"}`}>{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 space-y-3">
        {activeTab === "publicados" && postedJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100">
            <div className="flex gap-4 p-4">
              <img src={job.image} alt={job.title} className="w-20 h-20 object-cover rounded-2xl" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#111827] mb-2 line-clamp-1 text-base">{job.title}</h3>
                <Badge variant="info" icon={<AlertCircle size={12} />}>Publicado</Badge>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500"><MapPin size={12} /><span>{job.location}</span></div>
              </div>
              <p className="text-[#10B981] font-bold text-base">{job.priceLabel}</p>
            </div>
          </div>
        ))}

        {activeTab === "postulados" && appliedRows.map(({ application, job }) => (
          <div key={application.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 p-4">
            <h3 className="font-bold text-[#111827] mb-1">{job!.title}</h3>
            <p className="text-sm text-gray-500 mb-3">{application.coverMessage}</p>
            <div className="flex items-center justify-between">
              <Badge variant={application.status === "aceptada" ? "success" : "warning"}>
                {application.status === "aceptada" ? "Aceptada" : application.status === "rechazada" ? "Rechazada" : "Enviada"}
              </Badge>
              {application.status === "enviada" && (
                <button onClick={() => updateApplicationStatus(application.id, "aceptada")} className="text-xs text-[#10B981] font-semibold bg-green-50 px-3 py-1.5 rounded-full">
                  Marcar aceptada
                </button>
              )}
            </div>
          </div>
        ))}

        {activeTab === "completados" && completed.map((job) => (
          <div key={job.id} className="bg-white rounded-3xl p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#111827]">{job.title}</h3>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500"><Clock size={12} /><span>Trabajo finalizado</span></div>
            </div>
            <div className="flex items-center gap-1"><Star size={12} className="text-[#FBBF24] fill-[#FBBF24]" /><span className="text-xs text-gray-500">Calificado</span></div>
          </div>
        ))}

        {tabData[activeTab].length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-6 text-center">
            <CheckCircle size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-[#111827]">No hay trabajos en esta sección</p>
            <p className="text-sm text-gray-500">Cuando tengas actividad, la vas a ver acá.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
