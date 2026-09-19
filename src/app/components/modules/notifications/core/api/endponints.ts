import { BASE_URL } from "@/src/app/components/services/utils/config";

export const ENDPOINTS = {
  //----get-post-update-delete ----//
  notifications: `${BASE_URL}/api/v1/admin/notifications`,
  notificationsUnreadCount: `${BASE_URL}/api/v1/admin/notifications/unread-count`,
  notificationsReadAll: `${BASE_URL}/api/v1/admin/notifications/read-all`,
  notificationsClearAll: `${BASE_URL}/api/v1/admin/notifications/clear-all`,
};
