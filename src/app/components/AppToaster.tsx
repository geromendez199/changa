/**
 * WHY: Provide consistent success and error feedback across key marketplace actions without adding a custom notification system.
 * CHANGED: YYYY-MM-DD
 */
import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      expand={false}
      closeButton
      toastOptions={{
        duration: 2600,
        style: {
          background: "#FFFFFF",
          color: "#14211C",
          border: "1px solid #E3EBE6",
          borderRadius: "20px",
          boxShadow: "0 18px 40px rgba(17, 24, 39, 0.12)",
        },
      }}
    />
  );
}
