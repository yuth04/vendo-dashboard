"use client";

import React, { useCallback, useState } from "react";
import {
  Search,
  Calendar,
  Eye,
  Loader2,
  Filter,
  ChevronDown,
  Download,
  Clock,
} from "lucide-react";
import { AiOutlineHistory } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useAlert } from "@/src/app/components/context/AlertContext";
import {
  INITIAL_ORDER_HISTORY,
  OrderHistoryItem,
} from "@/src/app/components/modules/history-orders/core/models/historyOrderModel";
import { orderhistoryClient } from "@/src/app/components/modules/history-orders/core/api/historyOrderClient";
import { historyOrderService } from "@/src/app/components/modules/history-orders/core/services/historyOrderService";
import { useHistoryOrderData } from "@/src/app/components/modules/history-orders/core/hook/useHistoryOrderData";
import Pagination from "@/src/app/components/modules/history-orders/components/Pagination";

const HistoryOrder = () => {
  const { showToast } = useAlert();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

  const fetchFn = useCallback(
    (signal?: AbortSignal) => orderhistoryClient.fetchOrderHistory(signal),
    [],
  );

  const { data: apiRes, loading } = useHistoryOrderData(
    fetchFn,
    INITIAL_ORDER_HISTORY,
    true,
  );

  const orderList: OrderHistoryItem[] = apiRes?.data || [];

  const filteredOrders = historyOrderService.filterOrders(
    orderList,
    searchTerm,
    statusFilter,
  );
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const safePage = Math.min(currentPage, totalPages || 1);

  const currentOrders = historyOrderService.getCurrentPageOrders(
    filteredOrders,
    safePage,
    itemsPerPage,
  );

  const handleExport = async (type: "excel" | "pdf") => {
    try {
      const isExcel = type === "excel";
      const result = isExcel
        ? await orderhistoryClient.exportOrders()
        : await orderhistoryClient.fetchOrderPdf();

      if (result?.data) {
        const blob = result.data as unknown as Blob;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `Order_History_${type === "excel" ? "Export" : "Report"}_${new Date().getTime()}.${isExcel ? "xlsx" : "pdf"}`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        showToast(
          isExcel
            ? "Orders exported to Excel successfully!"
            : "Orders exported to PDF successfully!",
          "success",
        );
      }
    } catch (error) {
      console.error("Export Error:", error);
      showToast("Failed to export file.", "error");
    }
  };

  return (
    <div className="min-h-screen sm:p-6 py-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 custom-main-color-card rounded-full flex items-center justify-center custom-main-color-icon shrink-0">
              <AiOutlineHistory size={24} className="custom-main-color-icon" />
            </div>
            <div>
              <h1 className="text-[24px] md:text-[30px] font-bold text-[var(--header-text)]">
                Order History
              </h1>
              <p className="text-gray-500 text-[12px] md:text-sm mt-1">
                View and manage orders created via the Point of Sale system.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button
            onClick={() => handleExport("excel")}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full sm:text-[14px] text-[12px] font-bold transition-all shadow-sm whitespace-nowrap disabled:opacity-50 cursor-pointer"
          >
            <Download size={16} />
            Export Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2 card-theme text-[var(--header-text)] px-4 py-2.5 rounded-full sm:text-[14px] text-[12px] font-bold hover:bg-gray-50 transition whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6 card-theme rounded-[20px] p-3 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search order #, customer name or email..."
            className="w-full pl-11 pr-4 py-3 input-theme border border-gray-100 rounded-[20px] focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-base shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:flex gap-3">
          <div className="relative group min-w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none pl-11 pr-10 py-3 card-theme rounded-[20px] text-base font-bold text-slate-500 outline-none cursor-pointer shadow-sm"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipping">Shipping</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <Filter
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card-theme rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <Loader2
                className="animate-spin custom-main-color-icon"
                size={32}
              />
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 text-[14px]">
                  <tr className="border-b border-gray-50">
                    <th className="px-6 py-4">Order #</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Payment Method</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50">
                  {currentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                          <AiOutlineHistory className="w-12 h-12 text-gray-300" />
                          <span> No orders history found .</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentOrders.map((order, idx) => (
                      <tr
                        key={order.id || idx}
                        className="group hover:bg-gray-50/30 transition-all cursor-default"
                      >
                        <td className="px-8 py-4">
                          <div className="flex flex-col">
                            <span className="text-[13px] sm:text-[15px] md:text-[16px] font-black text-[var(--header-text)] whitespace-nowrap">
                              # {order.order_number}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} className="text-gray-400" />
                                <span className="text-[11px] sm:text-[12px] font-bold">
                                  {order.date}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={12} className="text-gray-400" />
                                <span className="text-[11px] sm:text-[12px] font-bold">
                                  {order.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="sm:w-12 sm:h-12 w-10 h-10 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                              {order.avatar &&
                              !brokenImages[order.id || idx] ? (
                                <img
                                  src={order.avatar}
                                  alt="avatar"
                                  className="w-full h-full object-cover"
                                  onError={() =>
                                    setBrokenImages((prev) => ({
                                      ...prev,
                                      [order.id || idx]: true,
                                    }))
                                  }
                                />
                              ) : (
                                <div className="w-full h-full custom-main-color-bg border border-cyan-100 flex items-center justify-center text-[12px] font-black text-white">
                                  {order.first_name
                                    ? order.first_name.charAt(0).toUpperCase()
                                    : "?"}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[14px] font-black text-[var(--header-text)]">
                                {order.first_name || ""} {order.last_name || ""}
                              </span>
                              <span className="text-[12px] font-bold text-gray-400">
                                {order.email || ""}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col">
                            <span className="font-black text-[var(--header-text)]">
                              ${order.total_price}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">
                              {order.items_count} Items
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400">{order.payment_method}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 sm:px-3 sm:py-1.5 border rounded-full text-[9px] font-black uppercase tracking-wider ${historyOrderService.getStatusStyles(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() =>
                                router.push(`/admin/history-orders/${order.id}`)
                              }
                              title="View details"
                              className="p-2 custom-main-color-text-hover custom-main-color-bg-hover rounded-full cursor-pointer"
                            >
                              <Eye size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
        {/* BOTTOM PACK (Total Items & Pagination) */}
        {filteredOrders.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 gap-4 border-t border-gray-50/50">
            <div className="text-sm text-gray-500 font-medium">
              Total items:{" "}
              <span className="font-bold text-emerald-500">
                {filteredOrders.length}
              </span>
              <span className="px-1">Order History</span>
            </div>

            {/* Only render Pagination if total items exceed itemsPerPage */}
            {filteredOrders.length > itemsPerPage && (
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryOrder;
