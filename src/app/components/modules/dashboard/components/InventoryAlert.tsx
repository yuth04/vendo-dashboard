import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { InventoryAlertItem } from "@/src/app/components/modules/dashboard/core/models/dashboardModel";

interface Props {
  data?: InventoryAlertItem[];
  loading?: boolean;
}

const alertColor = (
  alertType: InventoryAlertItem["alert_type"],
  stock: number,
) => {
  switch (alertType) {
    case "out_of_stock":
      return "bg-red-100 text-red-600";

    case "dead_stock":
      return "bg-red-100 text-red-600";

    case "old_stock":
      return "bg-purple-100 text-purple-600";

    case "slow_moving":
      return "bg-orange-100/80 text-orange-700";

    case "low_stock":
    default:
      if (stock <= 2) {
        return "bg-orange-100 text-orange-600";
      }

      return "bg-amber-100/80 text-amber-700";
  }
};

const alertLabel = (item: InventoryAlertItem) => {
  switch (item.alert_type) {
    case "out_of_stock":
      return "Out of stock";

    case "dead_stock":
      return `Dead stock · ${item.age_in_months ?? 0}m`;

    case "old_stock":
      return `Old stock · ${item.age_in_months ?? 0}m`;

    case "slow_moving":
      return `Slow moving · ${item.age_in_months ?? 0}m`;

    case "low_stock":
    default:
      return item.stock === 0 ? "Out of stock" : `${item.stock} left`;
  }
};

const InventoryAlert: React.FC<Props> = ({ data = [], loading = false }) => {
  if (!loading && data.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#FFF1F2] p-6 rounded-[2.5rem] border border-red-100/50 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-red-600 font-black text-lg">
          <AlertTriangle size={20} strokeWidth={2.5} />
          <span>Inventory Alert</span>
        </div>

        {loading && <Loader2 size={16} className="animate-spin text-red-400" />}
      </div>

      {/* COUNT */}
      <p className="text-xs text-red-500/90 mb-4 font-bold tracking-tight">
        {data.length} {data.length === 1 ? "item" : "items"} with inventory
        alerts
      </p>

      {/* LIST */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300">
        {loading ? (
          <>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-red-50 animate-pulse"
              >
                <div className="min-w-0 flex-1">
                  <div className="h-3 bg-slate-200 rounded w-32 mb-2" />
                  <div className="h-2 bg-slate-200 rounded w-20" />
                </div>

                <div className="h-6 w-20 bg-slate-200 rounded-xl ml-2" />
              </div>
            ))}
          </>
        ) : (
          data.map((item, index) => (
            <div
              key={`${item.id}-${item.size}-${item.color}-${index}`}
              className="bg-white px-5 py-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-100 hover:border-red-200 transition-colors"
            >
              {/* PRODUCT INFO */}
              <div className="min-w-0 flex-1 mr-3">
                <span className="text-sm font-bold text-slate-900 block truncate">
                  {item.product_name}
                </span>

                <span className="text-xs text-slate-400 font-semibold block mt-0.5">
                  {item.size || "—"} · {item.color || "—"}
                </span>

                {/* Aging stock extra information */}
                {(item.alert_type === "slow_moving" ||
                  item.alert_type === "old_stock" ||
                  item.alert_type === "dead_stock") && (
                  <span className="text-[11px] text-slate-400 font-medium block mt-1">
                    Remaining: {item.remaining_quantity ?? item.stock}
                  </span>
                )}
              </div>

              {/* ALERT BADGE */}
              <span
                className={`
                  text-xs
                  font-bold
                  whitespace-nowrap
                  px-3
                  py-1.5
                  rounded-xl
                  flex-shrink-0
                  ${alertColor(item.alert_type, item.stock)}
                `}
              >
                {alertLabel(item)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InventoryAlert;
