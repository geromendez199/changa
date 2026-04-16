/**
 * WHY: Make sign-up feel like the start of a two-sided marketplace journey with clearer intent-driven messaging and feedback.
 * CHANGED: YYYY-MM-DD
 */
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAuth } from "../../../context/AuthContext";
import { BrandLogo } from "../../components/BrandLogo";
import { PreviewModeNotice } from "../../components/PreviewModeNotice";
import { SurfaceCard } from "../../components/SurfaceCard";
import { ROLE_INTENT_DETAILS, useRoleIntent } from "../../../hooks/useRoleIntent";
import { FALLBACK_PREVIEW_MESSAGE, IS_DEVELOPMENT_FALLBACK } from "../../../services/service.utils";

export function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { roleIntent, setRoleIntent } = useRoleIntent();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
    if (password !== confirmPassword) return "Las contraseñas no coinciden.";
    return null;
  };

  const onSubmit = async () => {
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await signUp(email.trim(), password);
    setLoading(false);

    if (!result.ok) return setError(result.message || "No se pudo crear la cuenta.");

    setSuccess("Cuenta creada con éxito. Ya podés iniciar sesión.");
    toast.success("Cuenta creada", {
      description: "Ya podés entrar y empezar a usar Changa.",
    });
    setTimeout(() => navigate(`/login?role=${activeRole}`), 900);
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

        <div className="app-kicker mb-3">Empezá en minutos</div>
        <h1 className="mb-1 text-2xl font-bold tracking-[-0.02em] text-[var(--app-text)]">
          Crear cuenta
        </h1>
        <p className="mb-3 text-sm leading-relaxed text-[var(--app-text-muted)]">
          {roleDetails.authDescription}
        </p>

        {IS_DEVELOPMENT_FALLBACK ? (
          <PreviewModeNotice
            className="mb-4"
            compact
            title="Registro real desactivado"
            description={`${FALLBACK_PREVIEW_MESSAGE} En esta vista local podés recorrer la experiencia, pero la creación de cuentas necesita Supabase.`}
          />
        ) : null}

        <div className="mb-6 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-brand)]">
            Empezás como
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--app-text)]">{roleDetails.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--app-text-muted)]">
            Después vas a poder pedir ayuda y también trabajar desde la misma cuenta.
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
          <Input
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={setConfirmPassword}
            type="password"
            size="lg"
          />
        </div>

        {error ? (
          <p className="mt-4 rounded-[18px] border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-4 rounded-[18px] border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </p>
        ) : null}

        <div className="mt-5">
          <Button fullWidth onClick={onSubmit} disabled={loading || IS_DEVELOPMENT_FALLBACK}>
            {IS_DEVELOPMENT_FALLBACK
              ? "Conectá Supabase para crear cuentas"
              : loading
                ? "Creando cuenta..."
                : "Crear cuenta gratis"}
          </Button>
        </div>

        {IS_DEVELOPMENT_FALLBACK ? (
          <div className="mt-3">
            <Button fullWidth variant="secondary" onClick={() => navigate("/home")}>
              Explorar vista previa
            </Button>
          </div>
        ) : null}

        <p className="mt-5 text-center text-sm text-[var(--app-text-muted)]">
          ¿Ya tenés cuenta?{" "}
          <Link to={`/login?role=${activeRole}`} className="font-semibold text-[var(--app-brand)]">
            Iniciar sesión
          </Link>
        </p>
      </SurfaceCard>
    </div>
  );
}
