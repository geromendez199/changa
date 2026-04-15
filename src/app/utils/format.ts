export const formatDistance = (distanceKm: number) => `${distanceKm.toFixed(1)} km`;

export const formatUrgencyLabel = (urgency: "normal" | "urgente") =>
  urgency === "urgente" ? "Urgente" : undefined;

export const formatRelative = (isoDate: string): string => {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);

  if (diffMinutes < 1) return "Ahora";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Ayer";
  return `Hace ${diffDays} días`;
};
