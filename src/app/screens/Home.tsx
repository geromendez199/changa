/**
 * WHY: Turn the home screen into a clearer startup-style entry point with role-aware messaging, trust cues, and better loading and empty states.
 * CHANGED: YYYY-MM-DD
 */
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Compass,
  MapPin,
  MessageSquareText,
  Search,
  ShieldCheck,
  WalletCards,
  Wrench,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/Button";
import { JobCard } from "../components/JobCard";
import { JobCardSkeleton } from "../components/JobCardSkeleton";
import { Input } from "../components/Input";
import { useAppState } from "../hooks/useAppState";
import { formatDistance, formatUrgencyLabel } from "../utils/format";
import { categoryFilters } from "../constants/catalog";
import { EmptyStateCard } from "../components/EmptyStateCard";
import { BrandLogo } from "../components/BrandLogo";
import { PreviewModeNotice } from "../components/PreviewModeNotice";
import { SectionHeader } from "../components/SectionHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import { ROLE_INTENT_DETAILS, useRoleIntent } from "../../hooks/useRoleIntent";
import { getFallbackPreviewMessage } from "../../services/service.utils";

export function Home() {
  const navigate = useNavigate();
  const { roleIntent, roleIntentDetails, setRoleIntent } = useRoleIntent();
  const {
    jobs,
    isLoading,
    errorMessage,
    refreshJobs,
    selectedLocation,
    requestDeviceLocation,
    currentUserId,
    dataSource,
  } = useAppState();

  useEffect(() => {
    void refreshJobs();
  }, [refreshJobs]);

  const activeRole = roleIntent ?? "help";
  const roleToggleItems = [
    { id: "help" as const, label: ROLE_INTENT_DETAILS.help.label, icon: Wrench },
    { id: "work" as const, label: ROLE_INTENT_DETAILS.work.label, icon: BriefcaseBusiness },
  ];
  const trustHighlights = [
    { label: "Perfiles con reputación", icon: ShieldCheck },
    { label: "Chat con contexto", icon: MessageSquareText },
    { label: "Pagos protegidos", icon: WalletCards },
  ] as const;
  const featuredJobs = jobs.slice(0, 3);
  const nearbyJobs = [...jobs].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3);
  const shouldShowLoadingCards = isLoading && jobs.length === 0;
  const isPreview = dataSource === "fallback";

  const handlePrimaryIntentAction = () => {
    if (isPreview) {
      navigate(activeRole === "help" ? "/publish" : "/profile");
      return;
    }

    if (activeRole === "help") {
      navigate(currentUserId ? "/publish" : "/signup?role=help");
      return;
    }

    navigate(currentUserId ? "/profile/edit" : "/signup?role=work");
  };

  const handleSecondaryIntentAction = () => {
    if (isPreview) {
      navigate("/search");
      return;
    }

    if (activeRole === "help") {
      setRoleIntent("work");
      navigate("/search");
      return;
    }

    setRoleIntent("help");
    navigate(currentUserId ? "/publish" : "/signup?role=help");
  };

  return (
    <div className="app-screen pb-28">
      <div className="app-header-shell pb-8">
        <div className="flex items-center justify-between">
          <BrandLogo
            className="justify-start"
            imageClassName="h-16 w-auto object-contain"
            fallbackClassName="text-2xl font-bold tracking-tight text-[var(--app-text)]"
          />
          <button
            onClick={() => navigate(currentUserId ? "/notifications" : "/login")}
            className="app-icon-button"
            aria-label="Abrir notificaciones"
          >
            <Bell size={20} className="text-[var(--app-text-muted)]" />
          </button>
        </div>

        <Input
          placeholder="Buscar changas, oficios o categorías"
          icon={<Search size={20} />}
          size="lg"
          containerClassName="mt-5"
          onChange={(value) => navigate(`/search?q=${encodeURIComponent(value)}`)}
        />

        <SurfaceCard tone="muted" padding="sm" className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-[var(--app-text-muted)]">
              <MapPin size={16} className="text-[var(--app-brand)]" />
              <span className="font-semibold text-[var(--app-text)]">
                {selectedLocation || "Ubicación pendiente"}
              </span>
            </div>
            <button
              onClick={requestDeviceLocation}
              className="text-xs font-semibold text-[var(--app-brand)]"
            >
              Actualizar
            </button>
          </div>
        </SurfaceCard>

        {isPreview ? (
          <PreviewModeNotice
            className="mt-4"
            compact
            description={getFallbackPreviewMessage("el feed y la búsqueda")}
          />
        ) : null}
      </div>

      <div className="px-6 pt-6">
        <SurfaceCard padding="lg">
          <div className="app-kicker">
            Changa te conecta con tareas y oportunidades reales de tu zona
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {roleToggleItems.map((item) => {
              const isActive = activeRole === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setRoleIntent(item.id)}
                  className={`rounded-[22px] border px-4 py-3 text-left transition-all ${
                    isActive
                      ? "border-[var(--app-brand)] bg-[var(--app-brand-soft)] text-[var(--app-text)] shadow-[0_10px_24px_rgba(13,174,121,0.12)]"
                      : "border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]"
                  }`}
                >
                  <item.icon
                    size={18}
                    className={isActive ? "text-[var(--app-brand)]" : "text-[#93a299]"}
                  />
                  <p className="mt-2 text-sm font-semibold">{item.label}</p>
                </button>
              );
            })}
          </div>

          <h1 className="mt-5 text-2xl font-black leading-tight tracking-[-0.03em] text-[var(--app-text)]">
            {roleIntentDetails.homeTitle}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">
            {roleIntentDetails.homeDescription}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {trustHighlights.map((item) => (
              <SurfaceCard key={item.label} tone="muted" padding="sm" className="text-center">
                <item.icon size={18} className="mx-auto mb-2 text-[var(--app-brand)]" />
                <p className="text-[11px] font-semibold leading-tight text-[var(--app-text)]">
                  {item.label}
                </p>
              </SurfaceCard>
            ))}
          </div>

          <div className="mt-5 space-y-2">
            <Button
              fullWidth
              size="lg"
              onClick={handlePrimaryIntentAction}
              icon={<ArrowRight size={16} />}
            >
              {isPreview
                ? activeRole === "help"
                  ? "Ver cómo se publica"
                  : "Ver perfil de ejemplo"
                : activeRole === "help"
                  ? "Publicar una changa"
                  : currentUserId
                    ? "Completar mi perfil"
                    : "Crear cuenta para trabajar"}
            </Button>
            <Button fullWidth variant="secondary" onClick={handleSecondaryIntentAction}>
              {isPreview
                ? "Seguir explorando changas"
                : activeRole === "help"
                  ? "Quiero encontrar changas"
                  : "Necesito ayuda con una tarea"}
            </Button>
          </div>
        </SurfaceCard>
      </div>

      <div className="px-6 py-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {categoryFilters.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => navigate(`/search?category=${encodeURIComponent(cat)}`)}
              className={`flex items-center gap-2 rounded-full px-5 py-3 whitespace-nowrap transition-all duration-200 ${
                idx === 0
                  ? "bg-[var(--app-brand)] text-white shadow-[0_16px_30px_rgba(13,174,121,0.2)]"
                  : "border border-[var(--app-border)] bg-white text-[var(--app-text)]"
              }`}
            >
              <span className="font-semibold text-sm">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <SurfaceCard
          tone="soft"
          padding="sm"
          className="mx-6 mb-4 border-amber-100 bg-[#FFFDF7] text-sm text-[var(--app-text-muted)] shadow-none"
        >
          <p className="font-semibold text-[var(--app-text)]">
            No pudimos actualizar las changas ahora mismo.
          </p>
          <p className="mt-1">{errorMessage || "Intentá nuevamente en unos segundos."}</p>
          <button onClick={() => void refreshJobs()} className="mt-3 font-semibold text-[var(--app-brand)]">
            Reintentar
          </button>
        </SurfaceCard>
      )}

      {(featuredJobs.length > 0 || shouldShowLoadingCards) && (
        <div className="mb-8">
          <div className="px-6 mb-5">
            <SectionHeader
              title="Destacadas para hoy"
              subtitle="Pedidos activos con buena visibilidad y contexto claro."
              actionLabel="Ver todas"
              onAction={() => navigate("/search")}
            />
          </div>
          <div className="flex gap-4 overflow-x-auto px-6 scrollbar-hide -mx-6">
            <div className="w-4 flex-shrink-0" />
            {shouldShowLoadingCards
              ? Array.from({ length: 3 }).map((_, index) => (
                  <JobCardSkeleton key={`featured-skeleton-${index}`} featured />
                ))
              : featuredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    image={job.image}
                    title={job.title}
                    category={job.category}
                    price={job.priceLabel}
                    rating={job.rating}
                    distance={formatDistance(job.distanceKm)}
                    urgency={formatUrgencyLabel(job.urgency)}
                    featured
                  />
                ))}
            <div className="w-4 flex-shrink-0" />
          </div>
        </div>
      )}

      <div className="px-6">
        <div className="mb-5">
          <SectionHeader
            title="Cerca de tu zona"
            subtitle={
              isLoading
                ? "Buscando oportunidades cercanas..."
                : jobs.length > 0
                  ? `${jobs.length} changas activas para explorar`
                  : "Todavía no hay changas publicadas en esta zona"
            }
          />
        </div>

        {shouldShowLoadingCards ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <JobCardSkeleton key={`nearby-skeleton-${index}`} />
            ))}
          </div>
        ) : nearbyJobs.length > 0 ? (
          <div className="space-y-3">
            {nearbyJobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                image={job.image}
                title={job.title}
                description={job.description}
                category={job.category}
                price={job.priceLabel}
                rating={job.rating}
                distance={formatDistance(job.distanceKm)}
                urgency={formatUrgencyLabel(job.urgency)}
              />
            ))}
          </div>
        ) : (
          !isLoading && (
            <EmptyStateCard
              icon={<Compass size={28} />}
              eyebrow="Todavía no hay movimiento cerca"
              title="Tu zona todavía no tiene changas visibles"
              description="Podés publicar lo que necesitás o activar tu ubicación para priorizar resultados cercanos apenas aparezcan."
              note="Mientras tanto, también podés explorar categorías para descubrir oportunidades en otras zonas."
              actionLabel={activeRole === "help" ? "Publicar una changa" : "Explorar categorías"}
              onAction={() =>
                navigate(
                  activeRole === "help"
                    ? currentUserId
                      ? "/publish"
                      : "/login?redirect=%2Fpublish"
                    : "/search",
                )
              }
              secondaryActionLabel="Activar ubicación"
              onSecondaryAction={requestDeviceLocation}
            />
          )
        )}
      </div>

      <BottomNav />
    </div>
  );
}
