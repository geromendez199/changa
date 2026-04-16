/**
 * WHY: Standardize card surfaces so panels share the same radius, border, and depth hierarchy across screens.
 * CHANGED: YYYY-MM-DD
 */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "./ui/utils";

interface SurfaceCardProps extends ComponentPropsWithoutRef<"div"> {
  tone?: "default" | "muted" | "soft";
  padding?: "none" | "sm" | "md" | "lg";
}

const toneClasses: Record<NonNullable<SurfaceCardProps["tone"]>, string> = {
  default: "app-surface",
  muted: "app-surface-muted",
  soft: "app-surface-soft",
};

const paddingClasses: Record<NonNullable<SurfaceCardProps["padding"]>, string> = {
  none: "",
  sm: "p-[clamp(0.875rem,3vw,1rem)]",
  md: "p-[clamp(1rem,3.6vw,1.25rem)]",
  lg: "p-[clamp(1.125rem,4vw,1.5rem)]",
};

export const SurfaceCard = forwardRef<HTMLDivElement, SurfaceCardProps>(function SurfaceCard(
  { className, tone = "default", padding = "md", ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(toneClasses[tone], paddingClasses[padding], className)}
      {...props}
    />
  );
});
