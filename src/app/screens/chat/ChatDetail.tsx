/**
 * WHY: Make chat feel more intentional with clearer context and reliable feedback after sending messages.
 * CHANGED: YYYY-MM-DD
 */
import { CircleHelp, Flag, Send, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "../../components/Badge";
import { Input } from "../../components/Input";
import { PreviewModeNotice } from "../../components/PreviewModeNotice";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SurfaceCard } from "../../components/SurfaceCard";
import { UserAvatar } from "../../components/UserAvatar";
import { useAppState } from "../../hooks/useAppState";
import { formatRelative } from "../../utils/format";
import { getFallbackPreviewMessage } from "../../../services/service.utils";

export function ChatDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { conversations, messages, currentUserId, sendMessage, jobs, profiles, refreshChatDetail, dataSource } = useAppState();
  const [text, setText] = useState("");
  const [composerFeedback, setComposerFeedback] = useState<string | null>(null);
  const isPreview = dataSource === "fallback";

  const conversation = conversations.find((item) => item.id === id);

  useEffect(() => {
    if (id) {
      void refreshChatDetail(id);
    }
  }, [id, refreshChatDetail]);

  const conversationMessages = useMemo(
    () => messages.filter((msg) => msg.conversationId === id),
    [id, messages],
  );

  if (!conversation) {
    return (
      <div className="app-screen px-6 pt-20">
        <p className="text-sm text-[var(--app-text-muted)]">No pudimos cargar esta conversación.</p>
        <button onClick={() => navigate("/chat")} className="mt-3 font-semibold text-[var(--app-brand)]">
          Volver a mensajes
        </button>
      </div>
    );
  }

  const otherUserId = conversation.participantIds.find((item) => item !== currentUserId)!;
  const otherUser = profiles.find((u) => u.id === otherUserId);
  const relatedJob = jobs.find((job) => job.id === conversation.jobId);

  return (
    <div className="app-screen flex min-h-screen flex-col pb-24">
      <ScreenHeader
        title={otherUser?.name ?? "Conversación"}
        subtitle={relatedJob?.title}
        onBack={() => navigate(-1)}
      >
        <div className="flex items-start gap-3">
          <UserAvatar
            name={otherUser?.name}
            avatarUrl={otherUser?.avatarUrl}
            fallbackLetter={otherUser?.avatarLetter ?? "?"}
            size="md"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {otherUser?.verified ? (
                <Badge variant="verified" size="sm" icon={<Shield size={10} />}>
                  Verificado
                </Badge>
              ) : null}
              <p className="text-[11px] font-semibold text-[var(--app-brand)]">
                Coordiná por este chat para mantener el contexto de la changa.
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() =>
                  toast("Centro de ayuda", {
                    description: "La guía de seguridad del chat se va a sumar en una próxima etapa.",
                  })
                }
                className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-1.5 text-[11px] font-semibold text-[var(--app-text)]"
              >
                <span className="inline-flex items-center gap-1">
                  <CircleHelp size={12} />
                  Ayuda
                </span>
              </button>
              <button
                onClick={() =>
                  toast("Reporte registrado", {
                    description: "El flujo completo para reportar conversaciones se va a sumar en una próxima etapa.",
                  })
                }
                className="rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700"
              >
                <span className="inline-flex items-center gap-1">
                  <Flag size={12} />
                  Reportar
                </span>
              </button>
            </div>
          </div>
        </div>
      </ScreenHeader>

      <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto">
        {isPreview ? (
          <PreviewModeNotice
            compact
            description={`${getFallbackPreviewMessage("esta conversación")} El envío de mensajes reales sigue deshabilitado.`}
          />
        ) : null}

        {conversationMessages.map((message) => {
          const isOwn = message.senderUserId === currentUserId;
          return (
            <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-[22px] px-4 py-3 shadow-sm ${
                  isOwn
                    ? "bg-[var(--app-brand)] text-white"
                    : "border border-[var(--app-border)] bg-white text-[var(--app-text)]"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    isOwn ? "text-white/80" : "text-[var(--app-text-muted)]"
                  }`}
                >
                  {formatRelative(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        {conversationMessages.length === 0 && (
          <SurfaceCard tone="muted" padding="md" className="py-10 text-center text-sm text-[var(--app-text-muted)] shadow-none">
            Todavía no empezaron a coordinar. El primer mensaje suele destrabar rápido una changa.
          </SurfaceCard>
        )}
      </div>

      <div className="app-floating-bar fixed bottom-0 left-0 right-0 mx-auto flex max-w-md items-center gap-3 px-6 py-4">
        <div className="flex-1">
          <Input placeholder="Escribí un mensaje..." value={text} onChange={setText} size="lg" />
          {composerFeedback && (
            <p className="mt-2 text-xs font-medium text-[var(--app-brand)]">{composerFeedback}</p>
          )}
        </div>
        <button
          onClick={async () => {
            if (isPreview) {
              toast("Envío real deshabilitado", {
                description: "En la vista previa podés revisar la conversación, pero no enviar mensajes nuevos.",
              });
              return;
            }

            const result = await sendMessage(conversation.id, text);
            if (!result.ok) {
              toast.error("No pudimos enviar el mensaje", {
                description: result.message ?? "Intentá nuevamente.",
              });
              return;
            }

            setText("");
            setComposerFeedback("Mensaje enviado");
            window.setTimeout(() => setComposerFeedback(null), 2200);
          }}
          disabled={!text.trim() || isPreview}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--app-brand)] text-white disabled:bg-[#c9d3ce]"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
