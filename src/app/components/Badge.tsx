/**
 * WHY: Consolidate badge semantics so marketplace states like urgencia, verificación, y estados de trabajo share one visual language.
 * CHANGED: YYYY-MM-DD
 */
import { type ReactNode } from "react";
import { cn } from "./ui/utils";

interface BadgeProps {
  children: ReactNode;
  variant?:
    | "default"
    | "accent"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "verified"
    | "urgent"
    | "published"
    | "accepted"
    | "pending"
    | "completed";
  icon?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  icon,
  size = "md",
  className,
}: BadgeProps) {
  const variants = {
    default: "border border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]",
    accent: "border border-transparent bg-[var(--app-brand-soft)] text-[var(--app-brand)]",
    success:
      "border border-transparent bg-[var(--app-success-soft)] text-[var(--app-success-text)]",
    warning:
      "border border-transparent bg-[var(--app-warning-soft)] text-[var(--app-warning-text)]",
    error: "border border-transparent bg-[var(--app-danger-soft)] text-[var(--app-danger-text)]",
    info: "border border-transparent bg-[var(--app-info-soft)] text-[var(--app-info-text)]",
    verified:
      "border border-transparent bg-[var(--app-brand-soft)] text-[var(--app-brand)]",
    urgent: "border border-transparent bg-[var(--app-danger-soft)] text-[var(--app-danger-text)]",
    published:
      "border border-transparent bg-[var(--app-brand-soft)] text-[var(--app-brand)]",
    accepted:
      "border border-transparent bg-[var(--app-success-soft)] text-[var(--app-success-text)]",
    pending:
      "border border-transparent bg-[var(--app-warning-soft)] text-[var(--app-warning-text)]",
    completed:
      "border border-transparent bg-[var(--app-success-soft)] text-[var(--app-success-text)]",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-[11px]",
    md: "px-3 py-1.5 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold tracking-[-0.01em]",
        sizes[size],
        variants[variant],
        className,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
