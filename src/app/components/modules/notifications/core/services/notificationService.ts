"use client";

import { ApiResponse } from "@/src/app/components/services/utils/models";
import { notificationsClient } from "@/src/app/components/modules/notifications/core/api/notificationClient";

export interface NotificationProduct {
  name: string;
  qty: number;
  size: string;
  color: string;
  image: string;
}

export type NotificationType =
  | "order"
  | "system"
  | "slow_moving"
  | "old_stock"
  | "dead_stock";

export interface NotificationOrder {
  id: number;
  type?: NotificationType;
  title?: string;
  message: string;
  icon?: string;
  url?: string;

  // Present on order-type notifications
  first_name?: string;
  last_name?: string;
  email?: string;
  image?: string;
  total?: string;
  products?: NotificationProduct[];
  is_read?: boolean;
  is_seen?: boolean;
  time?: string;
  time_ago?: string;
  created_at?: string;
  created_at_human?: string;
}

export interface NotificationResponse {
  orders: NotificationOrder[];
}

export interface NotificationDetailResponse {
  order: NotificationOrder;
}

export const notificationService = {
  /**
   * Fetches all registered system notifications wrapped inside standard response layout.
   */
  async getNotifications(
    signal?: AbortSignal,
  ): Promise<ApiResponse<NotificationOrder[]>> {
    try {
      const response = await notificationsClient.getNotifications(signal);
      return { data: response, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error?.message || "Failed to fetch notifications" },
      };
    }
  },

  /**
   * Fetches details of a specific target notification by its identifier.
   */
  async getNotificationById(
    id: string | number,
    signal?: AbortSignal,
  ): Promise<ApiResponse<NotificationOrder>> {
    try {
      const response = await notificationsClient.getNotificationById(
        Number(id),
        signal,
      );
      return { data: response, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error?.message || "Failed to fetch notification details",
        },
      };
    }
  },

  /**
   * Gets the current unread notification count.
   */
  async getUnreadCount(
    signal?: AbortSignal,
  ): Promise<ApiResponse<{ count: number }>> {
    try {
      const response = await notificationsClient.getUnreadCount(signal);
      return { data: response, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error?.message || "Failed to fetch unread count" },
      };
    }
  },

  /**
   * Marks a single notification (order or system) as seen/read.
   */
  async markAsSeen(
    id: string | number,
    type: "order" | "system" = "order",
  ): Promise<ApiResponse<any>> {
    try {
      const response = await notificationsClient.markAsSeen(Number(id), type);
      return { data: response, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error?.message || "Failed to mark notification as read",
        },
      };
    }
  },

  /**
   * Fetches the redirect URL for a notification, marking it read as a side effect.
   */
  async redirect(
    id: string | number,
    type: "order" | "system" = "order",
  ): Promise<ApiResponse<{ url: string | null }>> {
    try {
      const response = await notificationsClient.redirect(Number(id), type);
      return { data: response, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error?.message || "Failed to redirect" },
      };
    }
  },

  /**
   * Marks every notification as read.
   */
  async markAllAsRead(): Promise<ApiResponse<any>> {
    try {
      const response = await notificationsClient.markAllAsRead();
      return { data: response, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error?.message || "Failed to mark all as read" },
      };
    }
  },

  /**
   * Deletes a targeted notification completely from the database.
   */
  async deleteNotification(id: string | number): Promise<ApiResponse<any>> {
    try {
      const response = await notificationsClient.deleteNotification(Number(id));
      return { data: response, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error?.message || "Failed to delete notification" },
      };
    }
  },

  /**
   * Clears all notifications.
   */
  async clearAll(): Promise<ApiResponse<any>> {
    try {
      const response = await notificationsClient.clearAll();
      return { data: response, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error?.message || "Failed to clear notifications" },
      };
    }
  },
};
