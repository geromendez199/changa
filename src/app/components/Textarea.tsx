/**
 * WHY: Reuse the same text-field surface for longer free-text inputs instead of styling textareas ad hoc per screen.
 * CHANGED: YYYY-MM-DD
 */
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "./ui/utils";

interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "app-field min-h-32 resize-none px-4 py-3.5 text-[15px] leading-relaxed",
        error && "border-[var(--app-danger-text)] ring-4 ring-red-500/10",
        className,
      )}
      {...props}
    />
  );
});
