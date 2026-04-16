/**
 * WHY: Personalize auth copy based on the user's intent so login feels like the next step in a product journey, not a generic form.
 * CHANGED: YYYY-MM-DD
 */
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAuth } from "../../../context/AuthContext";
import { BrandLogo } from "../../components/BrandLogo";
import { PreviewModeNotice } from "../../components/PreviewModeNotice";
import { SurfaceCard } from "../../components/SurfaceCard";
import { ROLE_INTENT_DETAILS, useRoleIntent } from "../../../hooks/useRoleIntent";
import { FALLBACK_PREVIEW_MESSAGE, IS_DEVELOPMENT_FALLBACK } from "../../../services/service.utils";

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { roleIntent, setRoleIntent } = useRoleIntent();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const queryRole = new URLSearchParams(location.search).get("role");
  const activeRole =
    queryRole === "help" || queryRole === "work" ? queryRole : (roleIntent ?? "help");
  const roleDetails = ROLE_INTENT_DETAILS[activeRole];

  useEffect(() => {
    if (queryRole === "help" || queryRole === "work") {
      setRoleIntent(queryRole);
    }
  }, [queryRole, setRoleIntent]);

  const validate = () => {
    if (!email.includes("@")) return "Ingresá un email válido.";
    if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    return null;
  };

  const onSubmit = async () => {
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    setError(null);
    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (!result.ok) return setError(result.message || "No se pudo iniciar sesión.");

    const redirectTo = new URLSearchParams(location.search).get("redirect") || "/home";
    navigate(redirectTo);
  };

  return (
    <div className="app-screen flex items-center px-6 pt-12 pb-10">
      <SurfaceCard className="w-full" padding="lg">
        <div className="mb-5 flex justify-center">
          <BrandLogo
            imageClassName="h-14 w-auto object-contain"
            fallbackClassName="text-3xl font-bold tracking-tight text-[var(--app-text)]"
            alt="Changa"
          />
        </div>

        <div className="app-kicker mb-3">Entrá y seguí coordinando</div>
        <h1 className="mb-1 text-2xl font-bold tracking-[-0.02em] text-[var(--app-text)]">
          Iniciar sesión
        </h1>
        <p className="mb-3 text-sm leading-relaxed text-[var(--app-text-muted)]">
          {roleDetails.authDescription}
        </p>

        {IS_DEVELOPMENT_FALLBACK ? (
          <PreviewModeNotice
            className="mb-4"
            compact
            title="Ingreso real desactivado"
            description={`${FALLBACK_PREVIEW_MESSAGE} Para probar acceso real y cuentas nuevas necesitás conectar Supabase.`}
          />
        ) : null}

        <div className="mb-6 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-brand)]">
            Cómo querés usar Changa
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--app-text)]">{roleDetails.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--app-text-muted)]">
            Podés cambiar este enfoque más adelante sin perder tu cuenta.
          </p>
        </div>

        <div className="space-y-3">
          <Input placeholder="Email" value={email} onChange={setEmail} type="email" size="lg" />
          <Input
            placeholder="Contraseña"
            value={password}
            onChange={setPassword}
            type="password"
            size="lg"
          />
        </div>

        {error ? (
          <p className="mt-4 rounded-[18px] border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <div className="mt-5 space-y-3">
          <Button fullWidth onClick={onSubmit} disabled={loading || IS_DEVELOPMENT_FALLBACK}>
            {IS_DEVELOPMENT_FALLBACK
              ? "Conectá Supabase para ingresar"
              : loading
                ? "Ingresando..."
                : "Entrar y continuar"}
          </Button>
          <Button fullWidth variant="soft" disabled>
            Google (Próximamente)
          </Button>
          {IS_DEVELOPMENT_FALLBACK ? (
            <Button fullWidth variant="secondary" onClick={() => navigate("/home")}>
              Explorar vista previa
            </Button>
          ) : null}
        </div>

        <p className="mt-5 text-center text-sm text-[var(--app-text-muted)]">
          ¿No tenés cuenta?{" "}
          <Link to={`/signup?role=${activeRole}`} className="font-semibold text-[var(--app-brand)]">
            Crear cuenta
          </Link>
        </p>
      </SurfaceCard>
    </div>
  );
}
