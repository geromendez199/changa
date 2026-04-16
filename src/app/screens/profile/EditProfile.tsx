/**
 * WHY: Improve profile-edit feedback and trust-building copy so users understand why completing their profile matters.
 * CHANGED: YYYY-MM-DD
 */
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { PreviewModeNotice } from "../../components/PreviewModeNotice";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SurfaceCard } from "../../components/SurfaceCard";
import { Textarea } from "../../components/Textarea";
import { UserAvatar } from "../../components/UserAvatar";
import { useAppState, useCurrentUser } from "../../hooks/useAppState";
import { getFallbackPreviewMessage } from "../../../services/service.utils";

export function EditProfile() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { saveUserProfile, dataSource } = useAppState();
  const [name, setName] = useState(user?.name || "");
  const [location, setLocation] = useState(user?.location || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isPreview = dataSource === "fallback";

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setLocation(user.location || "");
    setBio(user.bio || "");
    setAvatarUrl(user.avatarUrl || "");
  }, [user]);

  if (!user) return null;

  const onSave = async () => {
    setFeedback(null);

    const trimmedName = name.trim();
    const trimmedLocation = location.trim();

    if (!trimmedName) {
      setFeedback({ type: "error", message: "Ingresá un nombre válido." });
      return;
    }

    if (!trimmedLocation) {
      setFeedback({ type: "error", message: "Ingresá una ubicación válida." });
      return;
    }

    setIsSaving(true);
    const result = await saveUserProfile({
      fullName: trimmedName,
      location: trimmedLocation,
      bio,
      avatarUrl,
    });
    setIsSaving(false);

    if (!result.ok) {
      const message = result.message || "No pudimos guardar tus datos.";
      setFeedback({ type: "error", message });
      toast.error("No pudimos guardar el perfil", {
        description: message,
      });
      return;
    }

    setFeedback({ type: "success", message: "Perfil guardado correctamente" });
    toast.success("Perfil actualizado", {
      description: avatarUrl.trim()
        ? "Los datos principales ya se actualizaron. La foto queda guardada en este dispositivo mientras terminamos la sincronización segura."
        : "Tus cambios principales ya están visibles en Changa.",
    });
    setTimeout(() => navigate("/profile"), 900);
  };

  return (
    <div className="app-screen pb-8">
      <ScreenHeader
        title="Editar perfil"
        subtitle="Un perfil claro genera más confianza y mejores respuestas."
        onBack={() => navigate(-1)}
      />

      <div className="space-y-4 px-6 py-6">
        {isPreview ? (
          <PreviewModeNotice
            description={`${getFallbackPreviewMessage("la edición de perfil")} Podés revisar la interfaz, pero el guardado real sigue deshabilitado.`}
          />
        ) : null}

        <SurfaceCard tone="soft" padding="md" className="text-sm leading-relaxed text-[var(--app-text-muted)] shadow-none">
          Sumá una foto, tu ubicación y una breve presentación para que otras personas entiendan
          rápido quién sos y por qué confiar en vos.
        </SurfaceCard>

        <SurfaceCard tone="soft" padding="sm" className="text-sm leading-relaxed text-[var(--app-text-muted)] shadow-none">
          La foto por URL todavía se guarda en este dispositivo mientras terminamos la
          sincronización segura del avatar entre sesiones y equipos.
        </SurfaceCard>

        <SurfaceCard padding="lg" className="space-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={name || user.name}
              avatarUrl={avatarUrl || user.avatarUrl}
              fallbackLetter={user.avatarLetter}
              size="lg"
              tone={avatarUrl ? "surface" : "soft"}
            />
            <div>
              <p className="text-sm font-semibold text-[var(--app-text)]">Vista previa del perfil</p>
              <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                Si pegás una URL de imagen válida, se va a ver así en tu perfil y en tus chats.
              </p>
            </div>
          </div>

          <Input placeholder="URL de foto de perfil" value={avatarUrl} onChange={setAvatarUrl} size="lg" />
          <Input placeholder="Nombre público" value={name} onChange={setName} size="lg" />
          <Input placeholder="Ubicación" value={location} onChange={setLocation} size="lg" />
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Contá qué tipo de tareas hacés, cómo trabajás o cualquier dato que aporte confianza."
          />
        </SurfaceCard>

        {feedback?.type === "success" ? (
          <div className="rounded-[18px] border border-green-100 bg-green-50 p-3 text-sm text-green-700">
            {feedback.message}
          </div>
        ) : null}
        {feedback?.type === "error" ? (
          <div className="rounded-[18px] border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            {feedback.message}
          </div>
        ) : null}

        <Button fullWidth size="lg" onClick={onSave} icon={<Save size={18} />} disabled={isSaving || isPreview}>
          {isPreview ? "Guardado real disponible con Supabase" : isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
