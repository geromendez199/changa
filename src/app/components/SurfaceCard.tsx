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
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
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
