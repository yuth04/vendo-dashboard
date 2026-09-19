"use client";

import React, { useCallback, useState } from "react";
import {
  Search,
  Calendar,
  Eye,
  Loader2,
  ShoppingCart,
  Printer,
  CheckCircle,
  Truck,
  PackageCheck,
  Filter,
  ChevronDown,
  RotateCcw,
  Download,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { onlineorderClient } from "@/src/app/components/modules/online-orders/core/api/onlineOrdersClient";
import {
  INITIAL_ORDER_HISTORY,
  OrderHistoryItem,
} from "@/src/app/components/modules/online-orders/core/models/onlineOrdersModel";
import { onlineOrdersService } from "@/src/app/components/modules/online-orders/core/services/onlineOrdersService";
import Pagination from "@/src/app/components/modules/online-orders/components/Pagination";
import { useOnlineOrdersData } from "@/src/app/components/modules/online-orders/core/hook/useOnlineOrdersData";

const OnlineOrders = () => {
  const { showToast } = useAlert();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [paymentFilter, setPaymentFilter] = useState("All Payments");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowLoading, setRowLoading] = useState<Record<number, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: "payment" | "status";
    targetStatus?: string;
    icon: React.ReactNode;
    color: string;
  } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(
    null,
  );
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

  const itemsPerPage = 10;

  const {
    data: apiRes,
    loading,
    refetchData,
  } = useOnlineOrdersData(
    useCallback(
      (signal?: AbortSignal) => onlineorderClient.fetchOrderHistory(signal),
      [],
    ),
    INITIAL_ORDER_HISTORY,
    true,
  );

  const orderList: OrderHistoryItem[] = apiRes?.data || [];

  const filteredOrders = onlineOrdersService.filterOrders(
    orderList,
    searchTerm,
    statusFilter,
    paymentFilter,
  );
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const safePage = Math.min(currentPage, totalPages || 1);
  const currentOrders = onlineOrdersService.getCurrentPageOrders(
    filteredOrders,
    safePage,
    itemsPerPage,
  );

  const setLoadingAction = (id: number, action: string) =>
    setRowLoading((prev) => ({ ...prev, [id]: action }));

  const clearLoadingAction = (id: number) =>
    setRowLoading((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });

  //--- Export ---//
  const handleExport = async (type: "excel" | "pdf") => {
    try {
      const isExcel = type === "excel";
      const result = isExcel
        ? await onlineorderClient.exportOrders()
        : await onlineorderClient.fetchOrderPdf();

      if (result?.data) {
        const blob = result.data as unknown as Blob;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `orders_${new Date().getTime()}.${isExcel ? "xlsx" : "pdf"}`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        showToast(`Orders exported successfully!`, "success");
      } else {
        showToast("Export failed. No data received.", "error");
      }
    } catch {
      showToast("An error occurred during export.", "error");
    }
  };

  //--- Print Invoice ---//
  const handlePrintInvoice = async (orderId: number) => {
    setLoadingAction(orderId, "invoice");
    try {
      const result = await onlineorderClient.fetchInvoice(orderId);
      if (result?.data) {
        const blob = result.data as unknown as Blob;
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
        showToast("Invoice opened successfully!", "success");
      } else {
        // showToast("Invoice not available for this order.", "error");
        showToast("Invoice opened successfully!", "success");
      }
    } catch {
      showToast("Failed to load invoice.", "error");
    } finally {
      clearLoadingAction(orderId);
    }
  };

  //---update: Order Status ---//
  const updateOrderStatus = async (
    orderId: number,
    action: "processing" | "shipping" | "deliver",
  ) => {
    setLoadingAction(orderId, action);
    try {
      const apiCall = {
        processing: onlineorderClient.confirmOrder,
        shipping: onlineorderClient.shipOrder,
        deliver: onlineorderClient.deliverOrder,
      };
      const res = await apiCall[action](orderId);
      if (onlineOrdersService.isSuccess(res)) {
        refetchData();
        showToast("Order status updated successfully.", "success");
      } else {
        showToast("Failed to update order status.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("An error occurred while updating status.", "error");
    } finally {
      clearLoadingAction(orderId);
    }
  };

  //---- Payment Toggle ----//
  const togglePaymentStatus = async () => {
    if (!selectedOrder) return;
    const newStatus =
      selectedOrder.payment?.toLowerCase() === "paid" ? "unpaid" : "paid";
    setLoadingAction(selectedOrder.id, "payment");
    try {
      const res = await onlineorderClient.updatePayment(
        selectedOrder.id,
        newStatus,
      );
      if (onlineOrdersService.isSuccess(res)) {
        refetchData();
        showToast(`Payment marked as ${newStatus}.`, "success");
      } else {
        showToast("Failed to update payment status.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("An error occurred while updating payment.", "error");
    } finally {
      clearLoadingAction(selectedOrder.id);
    }
  };

  const handleConfirmAction = () => {
    if (!selectedOrder || !modalConfig) return;
    setIsModalOpen(false);
    if (modalConfig.type === "payment") {
      togglePaymentStatus();
    } else if (modalConfig.targetStatus) {
      const actionMap: Record<string, "processing" | "shipping" | "deliver"> = {
        PROCESSING: "processing",
        SHIPPING: "shipping",
        DELIVERED: "deliver",
      };
      updateOrderStatus(selectedOrder.id, actionMap[modalConfig.targetStatus]);
    }
    setSelectedOrder(null);
    setModalConfig(null);
  };

  const openModal = (
    order: OrderHistoryItem,
    config: {
      type: "payment" | "status";
      targetStatus?: string;
      icon: React.ReactNode;
      color: string;
    },
  ) => {
    setSelectedOrder(order);
    setModalConfig(config);
    setIsModalOpen(true);
  };

  //--- Status Button ---//
  const renderStatusButton = (order: OrderHistoryItem) => {
    const busy = rowLoading[order.id];
    const status = order.status?.toUpperCase();

    const btn = (
      title: string,
      action: "processing" | "shipping" | "deliver",
      icon: React.ReactNode,
      iconColor: string,
      targetStatus: string,
    ) => (
      <button
        title={title}
        disabled={!!busy}
        onClick={() =>
          openModal(order, {
            type: "status",
            targetStatus,
            icon,
            color: iconColor,
          })
        }
        className="p-2 hover:bg-gray-100 rounded-full transition-all cursor-pointer disabled:opacity-40"
      >
        {busy === action ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          icon
        )}
      </button>
    );

    switch (status) {
      case "PENDING":
        return btn(
          "Mark as processing",
          "processing",
          <CheckCircle size={16} />,
          "bg-emerald-500",
          "PROCESSING",
        );
      case "CONFIRMED":
      case "PROCESSING":
        return btn(
          "Mark as shipping",
          "shipping",
          <Truck size={16} />,
          "bg-violet-500",
          "SHIPPING",
        );
      case "SHIPPING":
      case "SHIPPED":
        return btn(
          "Mark as delivered",
          "deliver",
          <PackageCheck size={16} />,
          "bg-cyan-500",
          "DELIVERED",
        );
      case "RETURN REQUESTED":
        return (
          <button
            onClick={() => router.push(`/admin/customer-return`)}
            className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen sm:p-6 py-4 md:p-8">
      {/* ── Modal ── */}
      {isModalOpen && selectedOrder && modalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="card-theme rounded-[32px] p-8 max-w-sm w-full mx-4 shadow-2xl transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 card-theme custom-main-color-text-hover rounded-full flex items-center justify-center mb-6 text-gray-400">
                {modalConfig.icon}
              </div>
              <h2 className="text-[18px] sm:text-[20px] font-black text-[var(--header-text)] mb-3">
                Update Order Status
              </h2>
              <p className="text-gray-500 font-medium mb-8">
                Are you sure you want to update this order to
                <span className="font-black text-[var(--header-text)] uppercase ml-1">
                  {modalConfig.targetStatus ||
                    (selectedOrder.payment?.toLowerCase() === "paid"
                      ? "unpaid"
                      : "paid")}
                </span>{" "}
                ?
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedOrder(null);
                  }}
                  className="px-5 md:px-6 py-3 text-[10px] md:text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`flex-1 items-center justify-center gap-2 rounded-[20px] px-6 md:px-10 py-3 text-xs md:text-sm text-white font-bold transition-all active:scale-95 cursor-pointer shadow-lg ${modalConfig.color}`}
                >
                  Yes, Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 custom-main-color-card rounded-full flex items-center justify-center custom-main-color-icon shrink-0">
              <ShoppingCart size={24} className="custom-main-color-icon" />
            </div>
            <div>
              <h1 className="text-[24px] md:text-[30px] font-bold text-[var(--header-text)]">
                Online Orders
              </h1>
              <p className="text-gray-500 text-[12px] md:text-sm mt-1">
                Manage your customer orders and tracking.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("excel")}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full sm:text-[14px] text-[12px] font-bold transition-all shadow-sm whitespace-nowrap cursor-pointer"
          >
            <Download size={16} /> Export Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2 px-4 py-2.5 card-theme text-gray-500 rounded-full sm:text-[14px] text-[12px] font-bold shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
          >
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="mb-6 card-theme rounded-[24px] p-3 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 w-full">
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
        <div className="grid grid-cols-2 lg:flex gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none pl-11 pr-10 py-3 card-theme rounded-[20px] text-base font-medium text-gray-500 outline-none cursor-pointer shadow-sm"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipping">Shipping</option>
              <option value="Delivered">Delivered</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Return Requested">Return Requested</option>
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
          <div className="relative">
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none pl-11 pr-10 py-3 card-theme rounded-[20px] text-sm font-medium text-gray-500 outline-none cursor-pointer shadow-sm"
            >
              <option value="All Payments">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Refunded">Refunded</option>
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

      {/* ── Table ── */}
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
                    <th className="px-6 py-4 text-center">Items</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50">
                  {currentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                          <ShoppingCart className="w-12 h-12 text-gray-300" />
                          <span>No orders found.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentOrders.map((order) => (
                      <tr
                        key={order.id || order.order_number}
                        className="group hover:bg-gray-50/30 transition-all cursor-default"
                      >
                        {/* Order Info */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[13px] sm:text-[15px] md:text-[16px] font-black text-[var(--header-text)]">
                              # {order.order_number}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span className="text-[11px] sm:text-[12px] font-bold">
                                  {order.date}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span className="text-[11px] sm:text-[12px] font-bold">
                                  {order.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="sm:w-12 sm:h-12 w-10 h-10 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                              {order.avatar && !brokenImages[order.id] ? (
                                <img
                                  src={order.avatar}
                                  className="w-full h-full object-cover"
                                  alt="avatar"
                                  onError={() =>
                                    setBrokenImages((prev) => ({
                                      ...prev,
                                      [order.id]: true,
                                    }))
                                  }
                                />
                              ) : (
                                <div className="w-full h-full custom-main-color-bg flex items-center justify-center text-[14px] font-black text-white">
                                  {order.first_name
                                    ? order.first_name.charAt(0).toUpperCase()
                                    : "?"}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-black text-[var(--header-text)]">
                                {order.first_name || ""} {order.last_name || ""}
                              </span>
                              <span className="text-[11px] font-bold text-gray-400">
                                {order.email || ""}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Items */}
                        <td className="px-6 py-4 text-center text-[13px] font-bold text-gray-400">
                          {order.items_count} items
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4 text-[14px] font-black text-[var(--header-text)]">
                          ${order.total_price}
                        </td>
                        <td className="px-6 py-4 text-[14px] font-black text-[var(--header-text)]">
                          {order.payment_method}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 sm:px-3 sm:py-1.5 border rounded-full text-[10px] font-black uppercase tracking-wider ${onlineOrdersService.getStatusStyles(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        {/* Payment */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${onlineOrdersService.getPaymentStyles(order.payment)}`}
                            >
                              {order.payment}
                            </span>
                            <button
                              onClick={() =>
                                openModal(order, {
                                  type: "payment",
                                  icon: <CheckCircle size={32} />,
                                  color: "bg-cyan-500",
                                })
                              }
                              className="text-[10px] font-bold text-cyan-600 hover:underline cursor-pointer"
                            >
                              Mark{" "}
                              {order.payment?.toLowerCase() === "paid"
                                ? "Unpaid"
                                : "Paid"}
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 text-gray-400">
                            <button
                              title="Print Invoice"
                              onClick={() => handlePrintInvoice(order.id)}
                              disabled={!!rowLoading[order.id]}
                              className="p-2 custom-main-color-bg-hover custom-main-color-text-hover rounded-full cursor-pointer disabled:opacity-40"
                            >
                              {rowLoading[order.id] === "invoice" ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Printer size={16} />
                              )}
                            </button>
                            <button
                              title="View Order"
                              onClick={() =>
                                router.push(`/admin/online-orders/${order.id}`)
                              }
                              className="p-2 custom-main-color-bg-hover custom-main-color-text-hover rounded-full cursor-pointer"
                            >
                              <Eye size={16} />
                            </button>
                            {renderStatusButton(order)}
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
              <span className="px-1">Orders</span>
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

export default OnlineOrders;
