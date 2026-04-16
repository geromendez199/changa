/**
 * WHY: Isolate conversation and message state so chat behavior can evolve independently from other app concerns.
 * CHANGED: YYYY-MM-DD
 */
import { useCallback, useState } from "react";
import {
  getConversationList,
  getConversationMessages,
  getOrCreateConversation,
  sendChatMessage,
} from "../services/chat.service";
import { shouldUseFallback, successResult } from "../services/service.utils";
import { Conversation, Message } from "../types/domain";

interface UseChatStateOptions {
  userId: string | null;
  pushError: (message?: string) => void;
}

interface SendMessageResult {
  ok: boolean;
  message?: string;
}

export function useChatState({ userId, pushError }: UseChatStateOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const loadConversationList = useCallback(async () => {
    if (!userId) {
      setConversations([]);
      return successResult<Conversation[]>([], "fallback");
    }

    const result = await getConversationList(userId);
    setConversations(result.data);
    pushError(result.error);
    return result;
  }, [pushError, userId]);

  const refreshChatDetail = useCallback(
    async (conversationId: string) => {
      const result = await getConversationMessages(conversationId);
      setMessages((prev) => {
        const withoutConversation = prev.filter(
          (message) => message.conversationId !== conversationId,
        );
        return [...withoutConversation, ...result.data];
      });
      pushError(result.error);
    },
    [pushError],
  );

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      if (!userId) {
        const message = "Necesitás iniciar sesión para enviar mensajes.";
        pushError(message);
        return { ok: false, message } satisfies SendMessageResult;
      }

      const result = await sendChatMessage({
        conversationId,
        senderUserId: userId,
        content,
      });
      if (!result.data) {
        const message = result.error ?? "No pudimos enviar tu mensaje.";
        pushError(message);
        return { ok: false, message } satisfies SendMessageResult;
      }

      setMessages((prev) => [...prev, result.data!]);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, lastMessageAt: result.data!.createdAt }
            : conversation,
        ),
      );

      return { ok: true } satisfies SendMessageResult;
    },
    [pushError, userId],
  );

  const resetChatState = useCallback(() => {
    setConversations([]);
    setMessages([]);
  }, []);

  const ensureConversation = useCallback(
    async (input: { participant1Id: string; participant2Id: string; jobId: string }) => {
      if (!userId) {
        return { ok: false, message: "Necesitás iniciar sesión para abrir el chat.", conversation: null as Conversation | null };
      }

      const existingConversation = conversations.find((conversation) => {
        const includesBothParticipants =
          conversation.participantIds.includes(input.participant1Id) &&
          conversation.participantIds.includes(input.participant2Id);

        return includesBothParticipants && conversation.jobId === input.jobId;
      });

      if (existingConversation) {
        return { ok: true, conversation: existingConversation, message: undefined };
      }

      if (shouldUseFallback()) {
        const fallbackConversation: Conversation = {
          id: `sample-conversation-${Date.now()}`,
          participantIds: [input.participant1Id, input.participant2Id],
          jobId: input.jobId,
          lastMessageAt: new Date().toISOString(),
        };

        setConversations((prev) => [fallbackConversation, ...prev]);
        return { ok: true, conversation: fallbackConversation, message: undefined };
      }

      const result = await getOrCreateConversation(input);
      if (!result.data) {
        const message = result.error ?? "No pudimos abrir la conversación.";
        pushError(message);
        return { ok: false, message, conversation: null as Conversation | null };
      }

      setConversations((prev) => {
        const withoutDuplicate = prev.filter((conversation) => conversation.id !== result.data!.id);
        return [result.data!, ...withoutDuplicate];
      });

      return { ok: true, conversation: result.data, message: undefined };
    },
    [conversations, pushError, userId],
  );

  return {
    conversations,
    messages,
    loadConversationList,
    refreshChatDetail,
    sendMessage,
    ensureConversation,
    resetChatState,
  };
}
