import React from "react";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { DashboardData } from "@/src/app/components/modules/dashboard/core/models/dashboardModel";

interface Props {
  data?: DashboardData;
  loading?: boolean;
  activeFilter?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: React.ReactNode;
  color: string;
  subText?: string;
  timeRange?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  icon,
  color,
  subText,
  timeRange,
}) => {
  const isNegative = trend?.startsWith("-");

  return (
    <div className="card-theme p-6 rounded-[2.5rem] border border-slate-50 bg-white shadow-sm flex flex-col hover:shadow-md transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-8">
        <div
          className={`${color} p-4 rounded-[1.2rem] transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>

        {trend && (
          <div
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
              isNegative
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {isNegative ? (
              <TrendingDown size={12} strokeWidth={3} />
            ) : (
              <TrendingUp size={12} strokeWidth={3} />
            )}

            <span className="text-[11px] font-black">{trend}</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
          {title}
        </p>

        <h2 className="text-4xl font-black text-[var(--header-text)] mb-2 tracking-tight">
          {value}
        </h2>

        <div className="flex flex-col gap-1">
          {subText && (
            <div className="flex items-center gap-2 text-emerald-600">
              <TrendingUp size={14} strokeWidth={2.5} />

              <span className="text-[12px] font-bold text-slate-500 tracking-tight">
                {subText}
              </span>
            </div>
          )}

          {timeRange && (
            <span className="text-[11px] italic text-slate-400 font-medium">
              {timeRange}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// const getTimeRangeLabel = (filter?: string) => {
//   switch (filter?.toLowerCase()) {
//     case "today":
//       return "from yesterday";
//     case "yesterday":
//       return "from day before";
//     case "week":
//       return "from last week";
//     case "month":
//       return "from last month";
//     case "year":
//       return "from last year";
//     default:
//       return "from previous period";
//   }
// };

const Overviews: React.FC<Props> = ({ data, loading, activeFilter }) => {
  //   const dynamicTimeRange = getTimeRangeLabel(activeFilter);

  const stats: StatCardProps[] = [
    {
      title: "Total Revenue",
      value: loading
        ? "—"
        : `$${Math.floor(Number(data?.total_revenue ?? 0)).toLocaleString()}`,
      trend: data?.revenue_percentage_change ?? "0%",
      subText: data?.profit_margin ?? "0% Margin",
      timeRange: data?.time_range_label ?? "from previous period",
      icon: <DollarSign size={24} className="text-emerald-600" />,
      color: "bg-emerald-50/60",
    },
    {
      title: "Active Orders",
      value: loading ? "—" : (data?.active_orders ?? 0),
      trend: data?.orders_percentage_change ?? "0%",
      subText: `Avg. Order: $${Number(data?.avg_order_value ?? 0).toFixed(0)}`,
      timeRange: data?.time_range_label ?? "from previous period",
      icon: <ShoppingBag size={24} className="text-blue-600" />,
      color: "bg-blue-50/60",
    },
    {
      title: "Total Customers",
      value: loading ? "—" : (data?.total_customers ?? 0),
      trend: data?.customers_percentage_change ?? "0%",
      subText: data?.new_customers_count ?? "+0 new this period",
      timeRange: data?.time_range_label ?? "from previous period",
      icon: <Users size={24} className="text-purple-600" />,
      color: "bg-purple-50/60",
    },
    {
      title: "Products",
      value: loading ? "—" : (data?.total_products ?? 0),
      subText: data?.total_brands_label ?? "0 Brands",
      timeRange: "inventory level",
      icon: <Package size={24} className="text-orange-600" />,
      color: "bg-orange-50/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
};

export default Overviews;
