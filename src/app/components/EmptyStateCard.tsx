/**
 * WHY: Keep empty states visually consistent with the rest of the product using the same card, icon, and CTA hierarchy.
 * CHANGED: YYYY-MM-DD
 */
import { type ReactNode } from "react";
import { Button } from "./Button";
import { SurfaceCard } from "./SurfaceCard";
import { cn } from "./ui/utils";

interface EmptyStateCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  eyebrow?: string;
  note?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyStateCard({
  icon,
  title,
  description,
  eyebrow,
  note,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EmptyStateCardProps) {
  return (
    <SurfaceCard className={cn("text-center", className)} padding="lg">
      {eyebrow && (
        <div className="app-kicker mb-4">
          {eyebrow}
        </div>
      )}
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface-soft)] text-[var(--app-brand)]">
        {icon}
      </div>
      <h3 className="mb-1 text-lg font-bold tracking-[-0.02em] text-[var(--app-text)]">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-[var(--app-text-muted)]">{description}</p>
      {note ? (
        <p className="mb-4 text-xs font-medium leading-relaxed text-[#8a9790]">{note}</p>
      ) : null}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col gap-2">
          {actionLabel && (
            <Button fullWidth onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button fullWidth variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </SurfaceCard>
  );
}
