/**
 * WHY: Reuse one polished loading treatment instead of repeating ad-hoc pulse blocks on each screen.
 * CHANGED: YYYY-MM-DD
 */
import { type HTMLAttributes } from "react";
import { cn } from "./ui/utils";

export function SkeletonBlock({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("app-skeleton rounded-[18px]", className)} {...props} />;
}
