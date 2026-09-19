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

  // present on order-type notifications
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
