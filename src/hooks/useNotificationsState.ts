/**
 * WHY: Keep notifications isolated so list-loading logic does not bloat the app-state composition hook.
 * CHANGED: YYYY-MM-DD
 */
import { useCallback, useState } from "react";
import { getMyNotifications } from "../services/notifications.service";
import { successResult } from "../services/service.utils";
import { Notification } from "../types/domain";

interface UseNotificationsStateOptions {
  userId: string | null;
  pushError: (message?: string) => void;
}

export function useNotificationsState({
  userId,
  pushError,
}: UseNotificationsStateOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return successResult<Notification[]>([], "fallback");
    }

    const result = await getMyNotifications(userId);
    setNotifications(result.data);
    pushError(result.error);
    return result;
  }, [pushError, userId]);

  const resetNotificationsState = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    loadNotifications,
    resetNotificationsState,
  };
}
