export interface OrderStats {
  total_orders: number;

  pending: number;
  confirmed: number;
  completed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number | string;
}

export interface TopProduct {
  id: number;
  productName: string;
  total_sold: number;
}

export interface RecentOrder {
  id: number;
  order_number: string;
  first_name: string;
  last_name: string;
  total_price: string;
  status: string;
  ordered_date: string | null;
  time: string;
}

export interface TopCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  image: string | null;
  orders_count: number;
}

export interface HourlyDistribution {
  hour: string;
  customer_count: number;
}

export interface CustomerStatsData {
  order_distribution_by_hour: HourlyDistribution[];
}

export type InventoryAlertType =
  | "low_stock"
  | "out_of_stock"
  | "slow_moving"
  | "old_stock"
  | "dead_stock";

export interface InventoryAlertItem {
  id: number;
  product_id: number;
  product_name: string;
  size?: string;
  color?: string;
  stock: number;
  alert_type: InventoryAlertType;
  age_in_months?: number;
  remaining_quantity?: number;
}

export interface OrderCarts {
  total: number;
  labels: string[];
  series: number[];
}

export interface DashboardData {
  // Overview
  total_revenue: number | string;
  revenue_percentage_change: string;
  profit_margin: string;
  active_orders: number;
  orders_percentage_change: string;
  total_customers: number;
  customers_percentage_change: string;
  new_customers_count: string;
  total_products: number;
  total_brands: number;
  total_brands_label: string;
  // Other dashboard data
  order_statistics: OrderStats;
  revenue_trend: RevenueTrendPoint[];
  top_customers: TopCustomer[];
  top_sold_products: TopProduct[];
  recent_orders: RecentOrder[];
  customer_stats: CustomerStatsData;
  inventory_alerts: InventoryAlertItem[];
  order_carts: OrderCarts;
  avg_order_value?: number | string;
  time_range_label: string;
}

export interface DashboardResponse {
  message: string;

  filter: string;

  date_range: {
    start: string;
    end: string;
  };

  data: DashboardData;
}
