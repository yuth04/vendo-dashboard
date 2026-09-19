import { apiClient } from "@/src/app/components/services/api/apiClient";
import {
  NotificationDetailResponse,
  NotificationResponse,
} from "@/src/app/components/modules/notifications/core/models/notificationModel";
import { ENDPOINTS } from "@/src/app/components/modules/notifications/core/api/endponints";

export const notificationsClient = {
  getNotifications: async (): Promise<NotificationResponse> => {
    const response = await apiClient.get<NotificationResponse>(
      ENDPOINTS.notifications,
    );
    return response.data as NotificationResponse;
  },

  getNotificationById: async (
    id: number,
  ): Promise<NotificationDetailResponse> => {
    const response = await apiClient.get<NotificationDetailResponse>(
      `${ENDPOINTS.notifications}/${id}`,
    );
    return response.data as NotificationDetailResponse;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>(
      ENDPOINTS.notificationsUnreadCount,
    );
    return response.data as { count: number };
  },

  // type: "order" | "system" — matches the ?type= query param the backend expects
  markAsSeen: async (
    id: number,
    type: "order" | "system" = "order",
  ): Promise<void> => {
    await apiClient.post(`${ENDPOINTS.notifications}/${id}/read?type=${type}`);
  },

  redirect: async (
    id: number,
    type: "order" | "system" = "order",
  ): Promise<{ url: string | null }> => {
    const response = await apiClient.post<{ url: string | null }>(
      `${ENDPOINTS.notifications}/${id}/redirect?type=${type}`,
    );
    return response.data as { url: string | null };
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post(ENDPOINTS.notificationsReadAll);
  },

  deleteNotification: async (id: number): Promise<void> => {
    await apiClient.delete(`${ENDPOINTS.notifications}/${id}`);
  },

  clearAll: async (): Promise<void> => {
    await apiClient.delete(ENDPOINTS.notificationsClearAll);
  },
};
