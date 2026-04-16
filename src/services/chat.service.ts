/**
 * WHY: Route chat sends through a single RPC so message creation and conversation timestamp updates stay atomic.
 * CHANGED: YYYY-MM-DD
 */
import { getSampleConversations, getSampleMessages } from "../data/mockData";
import { supabase } from "../lib/supabase";
import { chatMessageSchema, parseWithValidation } from "../lib/validation/schemas";
import { Conversation, Message } from "../types/domain";
import { ConversationsRow, MessagesRow, mapConversationRow, mapMessageRow } from "../types/supabase";
import { failureResult, isNonEmptyString, normalizeError, ServiceResult, shouldUseFallback, successResult, toSafeArray } from "./service.utils";

export async function getConversationList(currentUserId: string): Promise<ServiceResult<Conversation[]>> {
  if (!isNonEmptyString(currentUserId)) return successResult([], "fallback");
  if (shouldUseFallback()) return successResult(getSampleConversations(currentUserId), "fallback");

  try {
    const { data, error } = await supabase!
      .from("conversations")
      .select("*")
      .or(`participant_1_id.eq.${currentUserId},participant_2_id.eq.${currentUserId}`)
      .order("last_message_at", { ascending: false });

    if (error) throw error;

    const rows = toSafeArray<Partial<ConversationsRow>>(data)
      .map(mapConversationRow)
      .filter((conversation) => isNonEmptyString(conversation.id));

    return successResult(rows);
  } catch (error) {
    return failureResult([], normalizeError(error, "No pudimos cargar tus conversaciones."));
  }
}

export async function getConversationMessages(conversationId: string): Promise<ServiceResult<Message[]>> {
  if (!isNonEmptyString(conversationId)) return successResult([], "fallback");
  if (shouldUseFallback()) return successResult(getSampleMessages(conversationId), "fallback");

  try {
    const { data, error } = await supabase!
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const messages = toSafeArray<Partial<MessagesRow>>(data)
      .map(mapMessageRow)
      .filter((message) => isNonEmptyString(message.id));

    return successResult(messages);
  } catch (error) {
    return failureResult([], normalizeError(error, "No pudimos cargar los mensajes."));
  }
}

export async function sendChatMessage(input: { conversationId: string; senderUserId: string; content: string }): Promise<ServiceResult<Message | null>> {
  try {
    const validatedInput = parseWithValidation(chatMessageSchema, input);
    if (shouldUseFallback()) return failureResult(null, "Configurá Supabase para enviar mensajes reales.");

    const { data, error } = await supabase!.rpc("send_message", {
      p_conversation_id: validatedInput.conversationId,
      p_sender_user_id: validatedInput.senderUserId,
      p_content: validatedInput.content,
    });

    if (error) throw error;
    if (!data) return successResult(null);

    return successResult(mapMessageRow(data as Partial<MessagesRow>));
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos enviar tu mensaje."));
  }
}

export async function getOrCreateConversation(input: {
  participant1Id: string;
  participant2Id: string;
  jobId: string;
}): Promise<ServiceResult<Conversation | null>> {
  const participantIds = [input.participant1Id, input.participant2Id].filter(isNonEmptyString);
  if (participantIds.length !== 2 || !isNonEmptyString(input.jobId)) {
    return failureResult(null, "No pudimos preparar el chat para esta changa.");
  }

  if (shouldUseFallback()) return successResult(null, "fallback");

  try {
    const [participant1Id, participant2Id] = participantIds;

    const { data: existingRows, error: existingError } = await supabase!
      .from("conversations")
      .select("*")
      .eq("job_id", input.jobId)
      .or(
        `and(participant_1_id.eq.${participant1Id},participant_2_id.eq.${participant2Id}),and(participant_1_id.eq.${participant2Id},participant_2_id.eq.${participant1Id})`,
      )
      .limit(1);

    if (existingError) throw existingError;

    const existingConversation = toSafeArray<Partial<ConversationsRow>>(existingRows)
      .map(mapConversationRow)
      .find((conversation) => isNonEmptyString(conversation.id));

    if (existingConversation) return successResult(existingConversation);

    const { data, error } = await supabase!
      .from("conversations")
      .insert({
        participant_1_id: participant1Id,
        participant_2_id: participant2Id,
        job_id: input.jobId,
      })
      .select("*")
      .single<ConversationsRow>();

    if (error) throw error;

    return successResult(mapConversationRow(data));
  } catch (error) {
    return failureResult(null, normalizeError(error, "No pudimos abrir el chat de esta changa."));
  }
}
