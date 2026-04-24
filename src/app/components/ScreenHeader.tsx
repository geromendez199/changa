/**
 * WHY: Reuse a clean mobile header pattern so top bars stop drifting in spacing, controls, and typography.
 * CHANGED: YYYY-MM-DD
 */
import { ArrowLeft } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "./ui/utils";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
  children?: ReactNode;
  sticky?: boolean;
  className?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  action,
  children,
  sticky = false,
  className,
}: ScreenHeaderProps) {
  return (
    <div className={cn("app-header-shell", sticky && "sticky top-0 z-10", className)}>
      <div className="app-content-shell flex items-start gap-3">
        {onBack ? (
          <button onClick={onBack} className="app-icon-button mt-0.5 shrink-0" aria-label="Volver">
            <ArrowLeft size={20} />
          </button>
        ) : null}

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-normal text-[var(--app-text)] sm:text-2xl">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm leading-relaxed text-[var(--app-text-muted)]">{subtitle}</p>
          ) : null}
          {children ? <div className="mt-4">{children}</div> : null}
        </div>

        {action ? <div className="mt-0.5 shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
