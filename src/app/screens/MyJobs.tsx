/**
 * WHY: Standardize job management screens with clearer tabs, consistent status badges, and calmer card hierarchy.
 * CHANGED: YYYY-MM-DD
 */
import { BottomNav } from "../components/BottomNav";
import { MapPin, Clock, CheckCircle, AlertCircle, Star, BriefcaseBusiness, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/Badge";
import { useAppState } from "../hooks/useAppState";
import { EmptyStateCard } from "../components/EmptyStateCard";
import { useNavigate } from "react-router";
import { PreviewModeNotice } from "../components/PreviewModeNotice";
import { ScreenHeader } from "../components/ScreenHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import { getFallbackPreviewMessage } from "../../services/service.utils";

export function MyJobs() {
  const navigate = useNavigate();
  const { myJobs, applications, jobs, dataSource } = useAppState();
  const [activeTab, setActiveTab] = useState<"publicados" | "postulados" | "completados">("publicados");
  const isPreview = dataSource === "fallback";

  const appliedRows = useMemo(
    () => applications.map((application) => ({ application, job: jobs.find((j) => j.id === application.jobId) })).filter((item) => item.job),
    [applications, jobs],
  );
  const completed = useMemo(() => myJobs.filter((job) => job.status === "completado"), [myJobs]);

  const tabData = { publicados: myJobs, postulados: appliedRows, completados: completed } as const;

  return (
    <div className="app-screen pb-28">
      <ScreenHeader
        title="Mis trabajos"
        subtitle="Gestioná tus publicaciones, postulaciones y trabajos completados."
      >
        <div className="flex gap-2 rounded-[22px] bg-[var(--app-surface-muted)] p-1">
          {([
            ["publicados", "Publicados", myJobs.length],
            ["postulados", "Postulados", appliedRows.length],
            ["completados", "Hechos", completed.length],
          ] as const).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 rounded-[18px] py-2.5 text-sm font-semibold transition-all ${
                activeTab === key
                  ? "bg-white text-[var(--app-brand)] shadow-[0_8px_20px_rgba(17,24,39,0.06)]"
                  : "text-[var(--app-text-muted)]"
              }`}
            >
              {label}
              <span
                className={`ml-1.5 rounded-full px-2 py-0.5 text-xs ${
                  activeTab === key
                    ? "bg-[var(--app-brand)] text-white"
                    : "bg-[#dce5e0] text-[var(--app-text-muted)]"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </ScreenHeader>

      <div className="px-6 py-6 space-y-3">
        {isPreview ? (
          <PreviewModeNotice
            description={`${getFallbackPreviewMessage("mis trabajos")} El historial y los estados visibles son de ejemplo y las acciones sensibles siguen deshabilitadas.`}
          />
        ) : null}

        {activeTab === "postulados" && appliedRows.length > 0 ? (
          <SurfaceCard tone="soft" padding="sm" className="text-sm leading-relaxed text-[var(--app-text-muted)] shadow-none">
            El seguimiento completo de postulaciones dentro de la app todavía se está terminando.
            Por ahora mostramos el estado disponible sin simular cambios manuales.
          </SurfaceCard>
        ) : null}

        {activeTab === "publicados" && myJobs.map((job) => (
          <SurfaceCard key={job.id} padding="none" className="overflow-hidden">
            <div className="flex gap-4 p-4">
              <img src={job.image} alt={job.title} className="h-20 w-20 rounded-[20px] object-cover" />
              <div className="min-w-0 flex-1">
                <h3 className="mb-2 line-clamp-1 text-base font-bold tracking-[-0.02em] text-[var(--app-text)]">
                  {job.title}
                </h3>
                <Badge variant="published" icon={<AlertCircle size={12} />}>
                  Publicado
                </Badge>
                <div className="mt-3 flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                  <MapPin size={12} />
                  <span>{job.location}</span>
                </div>
              </div>
              <p className="text-base font-bold text-[var(--app-brand)]">{job.priceLabel}</p>
            </div>
          </SurfaceCard>
        ))}

        {activeTab === "postulados" && appliedRows.map(({ application, job }) => (
          <SurfaceCard key={application.id} padding="md">
            <h3 className="mb-1 font-bold tracking-[-0.02em] text-[var(--app-text)]">{job!.title}</h3>
            <p className="mb-3 text-sm leading-relaxed text-[var(--app-text-muted)]">{application.coverMessage}</p>
            <div className="flex items-center justify-between">
              <Badge
                variant={
                  application.status === "aceptada"
                    ? "accepted"
                    : application.status === "rechazada"
                      ? "error"
                      : "pending"
                }
              >
                {application.status === "aceptada"
                  ? "Aceptada"
                  : application.status === "rechazada"
                    ? "Rechazada"
                    : "Enviada"}
              </Badge>
              {application.status === "enviada" ? (
                <p className="text-right text-xs font-medium leading-relaxed text-[var(--app-text-muted)]">
                  La actualización manual del estado se suma en una próxima etapa.
                </p>
              ) : null}
            </div>
          </SurfaceCard>
        ))}

        {activeTab === "completados" && completed.map((job) => (
          <SurfaceCard key={job.id} padding="md" className="flex items-center justify-between">
            <div>
              <h3 className="font-bold tracking-[-0.02em] text-[var(--app-text)]">{job.title}</h3>
              <div className="mt-2 flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                <Clock size={12} />
                <span>Trabajo finalizado</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star size={12} className="text-[#FBBF24] fill-[#FBBF24]" />
              <Badge variant="completed" size="sm">
                Calificado
              </Badge>
            </div>
          </SurfaceCard>
        ))}

        {tabData[activeTab].length === 0 && (
          <EmptyStateCard
            icon={activeTab === "publicados" ? <BriefcaseBusiness size={28} /> : activeTab === "postulados" ? <Send size={28} /> : <CheckCircle size={28} />}
            eyebrow={activeTab === "publicados" ? "Sin publicaciones todavía" : activeTab === "postulados" ? "Todavía no te postulaste" : "Nada completado aún"}
            title={activeTab === "publicados" ? "Todavía no publicaste changas" : activeTab === "postulados" ? "No tenés postulaciones activas" : "Tus trabajos completados van a aparecer acá"}
            description={activeTab === "publicados" ? "Publicá tu primera changa para empezar a recibir respuestas de personas de tu zona." : activeTab === "postulados" ? "Explorá oportunidades y hacé tu primera postulación con un mensaje claro y confiable." : "Cuando cierres trabajos y acumules reseñas, esta sección va a mostrar tu historial."}
            note={activeTab === "publicados" ? "Una publicación clara suele recibir mejores respuestas y más rápido." : undefined}
            actionLabel={activeTab === "publicados" ? "Publicar una changa" : "Explorar changas"}
            onAction={() => navigate(activeTab === "publicados" ? "/publish" : "/search")}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
