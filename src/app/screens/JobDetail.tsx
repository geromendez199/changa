/**
 * WHY: Make job detail feel more credible with stronger poster trust signals and clear safety guidance around hiring.
 * CHANGED: YYYY-MM-DD
 */
import { ArrowLeft, Calendar, CircleHelp, Clock, Flag, Heart, MapPin, Phone, Shield, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { PreviewModeNotice } from "../components/PreviewModeNotice";
import { SectionHeader } from "../components/SectionHeader";
import { SkeletonBlock } from "../components/SkeletonBlock";
import { SurfaceCard } from "../components/SurfaceCard";
import { UserAvatar } from "../components/UserAvatar";
import { useAppState } from "../hooks/useAppState";
import { formatDistance, formatUrgencyLabel } from "../utils/format";
import { Job } from "../types/domain";
import { getFallbackPreviewMessage } from "../../services/service.utils";

export function JobDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { loadJobById, profiles, dataSource } = useAppState();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isPreview = dataSource === "fallback";

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      const data = await loadJobById(id);
      setJob(data);
      setIsLoading(false);
    }

    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="app-screen px-6 pt-20 pb-12">
        <SkeletonBlock className="h-[320px] rounded-[28px]" />
        <div className="mt-6 space-y-4">
          <SkeletonBlock className="h-7 w-4/5 rounded-full" />
          <div className="grid grid-cols-2 gap-3">
            <SkeletonBlock className="h-24 rounded-[24px]" />
            <SkeletonBlock className="h-24 rounded-[24px]" />
          </div>
          <SkeletonBlock className="h-28 rounded-[28px]" />
          <SkeletonBlock className="h-40 rounded-[28px]" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="app-screen px-6 pt-20">
        <button onClick={() => navigate(-1)} className="app-icon-button">
          <ArrowLeft size={24} className="text-[var(--app-text)]" />
        </button>
        <SurfaceCard className="mt-8 text-center" padding="lg">
          <h1 className="mb-2 text-xl font-bold tracking-[-0.02em] text-[var(--app-text)]">
            Trabajo no encontrado
          </h1>
          <p className="mb-6 text-sm text-[var(--app-text-muted)]">
            Esta changa no existe o fue eliminada.
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate("/search")} fullWidth>
              Ver otras changas
            </Button>
            <Button variant="secondary" onClick={() => id && void loadJobById(id).then(setJob)} fullWidth>
              Intentá nuevamente
            </Button>
          </div>
        </SurfaceCard>
      </div>
    );
  }

  const publisher = profiles.find((user) => user.id === job.postedByUserId);
  const phoneVerified = publisher?.trustIndicators.some((indicator) =>
    indicator.toLowerCase().includes("tel"),
  );
  const trustSignals = publisher
    ? [
        {
          label: "Identidad",
          value: publisher.verified ? "Verificada" : "Pendiente",
          icon: Shield,
        },
        {
          label: "Teléfono",
          value: phoneVerified ? "Verificado" : "Próximamente",
          icon: Phone,
        },
        {
          label: "Cumplimiento",
          value: `${publisher.successRate}%`,
          icon: Clock,
        },
      ]
    : [];

  return (
    <div className="app-screen pb-32">
      <div className="relative">
        <img src={job.image} alt={job.title} className="w-full h-[320px] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>

        <button onClick={() => navigate(-1)} className="app-icon-button absolute top-14 left-6 bg-white/95">
          <ArrowLeft size={20} className="text-[var(--app-text)]" />
        </button>

        <button
          onClick={() =>
            toast("Guardados en preparación", {
              description: "La lista de favoritas se va a sumar en una próxima etapa.",
            })
          }
          className="app-icon-button absolute top-14 right-6 bg-white/95"
        >
          <Heart size={20} className="text-[var(--app-text)]" />
        </button>

        <div className="absolute bottom-6 left-6 flex gap-2">
          <Badge variant="accent">{job.category}</Badge>
          {job.urgency === "urgente" ? (
            <Badge variant="urgent">{formatUrgencyLabel(job.urgency)}</Badge>
          ) : null}
        </div>
      </div>

      <div className="px-6 py-6">
        <h1 className="mb-3 text-2xl font-bold leading-tight tracking-[-0.03em] text-[var(--app-text)]">
          {job.title}
        </h1>

        {isPreview ? (
          <PreviewModeNotice
            className="mb-6"
            description={getFallbackPreviewMessage("esta publicación")}
          />
        ) : null}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <SurfaceCard tone="muted" padding="sm">
            <div className="mb-1 flex items-center gap-2 text-[var(--app-text-muted)]">
              <MapPin size={16} className="text-[var(--app-brand)]" />
              <span className="text-xs font-medium">Ubicación</span>
            </div>
            <p className="text-sm font-semibold text-[var(--app-text)]">{job.location}</p>
            <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">
              {formatDistance(job.distanceKm)} de distancia
            </p>
          </SurfaceCard>
          <SurfaceCard tone="muted" padding="sm">
            <div className="mb-1 flex items-center gap-2 text-[var(--app-text-muted)]">
              <Calendar size={16} className="text-[var(--app-brand)]" />
              <span className="text-xs font-medium">Disponibilidad</span>
            </div>
            <p className="text-sm font-semibold text-[var(--app-text)]">{job.availability}</p>
            <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">Horario flexible</p>
          </SurfaceCard>
        </div>

        <div className="bg-gradient-to-br from-[#0DAE79] to-[#0B9A6B] rounded-3xl p-6 mb-6 shadow-xl shadow-[#0DAE79]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Presupuesto</p>
              <p className="text-3xl font-bold text-white">{job.priceLabel}</p>
              <p className="text-white/70 text-xs mt-1">Pago al finalizar</p>
            </div>
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
              <Shield size={32} className="text-white" />
            </div>
          </div>
        </div>

        <SurfaceCard className="mb-6" padding="lg">
          <SectionHeader title="Descripción" />
          <p className="mt-4 leading-relaxed text-[var(--app-text-muted)]">{job.description}</p>
        </SurfaceCard>

        {publisher && (
          <SurfaceCard padding="md">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
              Publicado por
            </p>
            <div className="flex items-center gap-4">
              <UserAvatar
                name={publisher.name}
                avatarUrl={publisher.avatarUrl}
                fallbackLetter={publisher.avatarLetter}
                size="md"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-[var(--app-text)]">{publisher.name}</h3>
                  {publisher.verified ? (
                    <Badge variant="verified" icon={<Shield size={10} />}>
                      Verificado
                    </Badge>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-[#FBBF24] fill-[#FBBF24]" />
                    <span className="font-semibold text-[var(--app-text)]">{publisher.rating}</span>
                    <span className="text-[var(--app-text-muted)]">({publisher.totalReviews})</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-[#cad4cf]"></div>
                  <span className="text-[var(--app-text-muted)]">{publisher.completedJobs} trabajos</span>
                </div>
              </div>
            </div>

            {publisher.trustIndicators.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {publisher.trustIndicators.map((indicator) => (
                  <Badge key={indicator} variant="verified">
                    {indicator}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-4 grid grid-cols-3 gap-2">
              {trustSignals.map((signal) => (
                <SurfaceCard key={signal.label} tone="muted" padding="sm" className="text-center">
                  <signal.icon size={16} className="mx-auto mb-2 text-[var(--app-brand)]" />
                  <p className="text-[11px] font-semibold text-[var(--app-text-muted)]">
                    {signal.label}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[var(--app-text)]">{signal.value}</p>
                </SurfaceCard>
              ))}
            </div>
          </SurfaceCard>
        )}

        <div className="grid grid-cols-3 gap-3 mt-6">
          <SurfaceCard tone="muted" padding="sm" className="text-center">
            <Shield size={20} className="mx-auto mb-1 text-[var(--app-info-text)]" />
            <p className="text-xs font-semibold text-[var(--app-info-text)]">Pago protegido</p>
          </SurfaceCard>
          <SurfaceCard tone="muted" padding="sm" className="text-center">
            <Clock size={20} className="mx-auto mb-1 text-[var(--app-brand)]" />
            <p className="text-xs font-semibold text-[var(--app-brand)]">Contexto claro</p>
          </SurfaceCard>
          <SurfaceCard tone="muted" padding="sm" className="text-center">
            <Star size={20} className="mx-auto mb-1 text-[#b7791f]" />
            <p className="text-xs font-semibold text-[#b7791f]">Reputación visible</p>
          </SurfaceCard>
        </div>

        <SurfaceCard className="mt-6" padding="md">
          <h2 className="text-lg font-bold text-[var(--app-text)]">Antes de coordinar</h2>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--app-text-muted)]">
            <p>1. Revisá el perfil, las reseñas y la tasa de cumplimiento de la otra persona.</p>
            <p>2. Confirmá detalles, tiempos y alcance por chat para que quede todo claro.</p>
            <p>3. Priorizá pagos y acuerdos dentro de Changa para mantener contexto y respaldo.</p>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              onClick={() =>
                toast("Centro de ayuda", {
                  description: "La guía de seguridad se va a sumar en una próxima etapa.",
                })
              }
              variant="secondary"
              fullWidth
            >
              <span className="inline-flex items-center gap-2">
                <CircleHelp size={16} />
                Ayuda
              </span>
            </Button>
            <Button
              onClick={() =>
                toast("Reporte registrado", {
                  description: "El flujo completo para reportar publicaciones se va a sumar en una próxima etapa.",
                })
              }
              variant="danger"
              fullWidth
            >
              <span className="inline-flex items-center gap-2">
                <Flag size={16} />
                Reportar
              </span>
            </Button>
          </div>
        </SurfaceCard>
      </div>

      <div className="app-floating-bar fixed bottom-0 left-0 right-0 mx-auto max-w-md px-6 py-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              toast("Guardados en preparación", {
                description: "La lista de favoritas se va a sumar en una próxima etapa.",
              })
            }
            className="app-icon-button shrink-0"
          >
            <Heart size={20} className="text-[var(--app-text-muted)]" />
          </button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() =>
              toast(
                isPreview ? "Vista previa local" : "Postulación en preparación",
                {
                  description: isPreview
                    ? "Esta changa usa datos de muestra. Para postularte con una cuenta real hace falta conectar Supabase."
                    : "Estamos terminando el flujo completo de postulaciones y seguimiento dentro de la app.",
                },
              )
            }
          >
            {isPreview ? "Postulación disponible en modo real" : "Postulación en preparación"}
          </Button>
        </div>
      </div>
    </div>
  );
}
