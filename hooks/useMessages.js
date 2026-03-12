import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import * as api from '../lib/messages';
export function useMessages(bookingId, userId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const fetchAll = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      setMessages(await api.getMessages(bookingId));
      if (userId) setUnreadCount(await api.getUnreadCount(bookingId, userId));
    } finally { setLoading(false); }
  }, [bookingId, userId]);
  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    if (!bookingId) return;
    const channel = api.subscribeToMessages(bookingId, (msg) => setMessages((prev) => [...prev, msg]));
    return () => { channel?.unsubscribe?.(); };
  }, [bookingId]);
  useFocusEffect(useCallback(() => { if (bookingId && userId) api.markMessagesAsRead(bookingId, userId); }, [bookingId, userId]));
  const send = async (content) => {
    const { data } = await api.sendMessage(bookingId, userId, content);
    if (data) setMessages((prev) => [...prev, data]);
  };
  return { messages, loading, sendMessage: send, unreadCount };
}
