/**
 * WHY: Bring the fallback route into the same premium surface system as the rest of the app.
 * CHANGED: YYYY-MM-DD
 */
import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { SurfaceCard } from "../components/SurfaceCard";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="app-screen px-6 pt-20">
      <SurfaceCard className="text-center" padding="lg">
        <p className="mb-2 text-sm font-semibold text-[var(--app-brand)]">404</p>
        <h1 className="mb-2 text-2xl font-bold tracking-[-0.02em] text-[var(--app-text)]">
          Ruta inválida
        </h1>
        <p className="mb-6 text-sm text-[var(--app-text-muted)]">
          La pantalla que buscás no existe o fue movida.
        </p>
        <Button fullWidth onClick={() => navigate("/home")}>Ir al inicio</Button>
      </SurfaceCard>
    </div>
  );
}
