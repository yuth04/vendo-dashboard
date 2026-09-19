"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  Package,
  ChevronRight,
  History,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { OrderDetailsData } from "@/src/app/components/modules/history-orders/core/models/historyOrderModel";
import { orderhistoryClient } from "@/src/app/components/modules/history-orders/core/api/historyOrderClient";
import { historyOrderService } from "@/src/app/components/modules/history-orders/core/services/historyOrderService";
import { PageLoader } from "@/src/app/components/helpers/components/PageLoader";
import { DataNotFound } from "@/src/app/components/helpers/components/DataNotFound";

interface Props {
  orderId?: string | number;
  onBack?: () => void;
}

const DetailsHistoryOrder = ({ orderId, onBack }: Props) => {
  const [order, setOrder] = useState<OrderDetailsData | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const getDetails = async () => {
    if (!orderId || orderId === "undefined") return;
    try {
      setLoading(true);
      const id = typeof orderId === "string" ? parseInt(orderId, 10) : orderId;
      const res = await orderhistoryClient.fetchOrderDetails(id);
      const finalData = historyOrderService.extractOrderDetails(res);
      if (finalData) setOrder(finalData);
    } catch (err) {
      console.error("Fetch Details Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDetails();
  }, [orderId]);

  const handleBack = () => (onBack ? onBack() : router.back());

  if (loading) {
    return <PageLoader />;
  }

  if (!order) {
    return (
      <DataNotFound
        title="Order Not Found."
        message="We couldn't find any orders matching your search criteria."
        icon={History}
      />
    );
  }

  const subtotal = historyOrderService.calculateSubtotal(order);
  const shipping = historyOrderService.parseShippingFee(order);
  const total = historyOrderService.calculateTotal(order);
  const isPaid = historyOrderService.checkIsPaid(order);

  return (
    <div className="min-h-screen sm:p-4 py-4 md:p-8">
      <div className="sm:p-4">
        <nav className="flex items-center gap-2 text-[12px] sm:text-[14px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
          <span
            className="custom-main-color-text-hover cursor-pointer transition-colors whitespace-nowrap"
            onClick={() => router.push("/admin/dashboard")}
          >
            Dashboard
          </span>
          <ChevronRight size={12} className="text-gray-300 shrink-0" />
          <span
            className="custom-main-color-text-hover cursor-pointer transition-colors whitespace-nowrap"
            onClick={() => router.push("/admin/history-orders")}
          >
            History Orders
          </span>
          <ChevronRight size={12} className="text-gray-300 shrink-0" />
          <span className="text-[var(--header-text)] whitespace-nowrap">
            Orders Details
          </span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <button
              onClick={handleBack}
              className="p-2 sm:p-3 hover:bg-gray-100 card-theme rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft size={24} className="text-[var(--header-text)]" />
            </button>
            <div>
                  <h1 className="text-[20px] sm:text-[30px]  font-black text-[var(--header-text)] uppercase tracking-tight">
                  Order #{order.order_number}
                </h1>
              <div className="flex items-center gap-2 text-slate-400 mt-1">
                <Calendar size={14} />
                <span className="text-[12px] sm:text-[14px] font-bold">
                  {order.date}
                </span>
                <span className="text-slate-400 font-bold mb-1">{order.payment_method}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest ${historyOrderService.getStatusStyles(order.status)}`}
            >
              {order.status}
            </span>
            <span
              className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest ${isPaid ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"}`}
            >
              {order.payment_status}
            </span>
          </div>
        </div>
      </div>

      <div className="min-h-screen sm:p-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Order Items */}
          <div className="card-theme rounded-[32px] p-8 shadow-sm border border-gray-50">
            <div className="flex items-center gap-3 mb-8">
              <Package size={20} className="text-slate-400" />
              <h3 className="text-[17px] font-black text-[var(--header-text)]">
                Order Items
              </h3>
            </div>

            <div className="space-y-6">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-[24px] card-theme border border-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[18px] bg-white overflow-hidden flex items-center justify-center border border-gray-100">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name || "Product"}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="font-black text-slate-300 text-[10px]">
                          IMG
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-[var(--header-text)] text-[15px]">
                        {item.product_name || "Product"}
                      </h4>
                      <p className="text-[13px] font-bold text-slate-400 py-2">
                        Quantity : {item.quantity} × ${item.price}
                      </p>
                      <p className="text-[12px] font-bold text-[var(--header-text)] ">
                        Size: {item.size} | Color: {item.color}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-[var(--header-text)] text-[16px]">
                    ${item.subtotal}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-dashed border-gray-200 space-y-3">
              <div className="flex justify-between text-[14px] font-bold text-[var(--header-text)]">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[14px] font-bold">
                <span className="text-[var(--header-text)]">Shipping Fee</span>
                <span className="text-red-500">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-[18px] font-black text-[var(--header-text)]">
                  Total
                </span>
                <span className="text-[22px] font-black text-[var(--header-text)]">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="card-theme rounded-[32px] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <User size={18} className="text-slate-400" />
              <h3 className="text-[17px] font-black text-[var(--header-text)]">
                Customer
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-md">
                {order.customer?.avatar ? (
                  <img
                    src={order.customer.avatar}
                    alt="customer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-slate-400 font-black text-lg">
                    {order.customer?.first_name?.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-black text-[var(--header-text)] text-[15px]">
                  {order.customer?.first_name} {order.customer?.last_name}
                </h4>
                <p className="text-[13px] font-bold text-slate-400">
                  {order.customer?.email}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-slate-400" />
                <div>
                  <p className="text-[13px] font-black text-[var(--header-text)] mb-1">
                    Shipping Address
                  </p>
                  <div className="p-4 rounded-[20px] card-theme text-[12px] font-bold text-[var(--header-text)] leading-relaxed">
                    {/* Name */}
                    <span className="text-[var(--header-text)] block mb-1 text-[14px]">
                      {order.shipping_address?.first_name}{" "}
                      {order.shipping_address?.last_name}
                    </span>
                    {/* Address Details */}
                    {order.shipping_address?.address_line}
                    <br />
                    {order.shipping_address?.city},{" "}
                    {order.shipping_address?.province}
                    <br />
                    {order.shipping_address?.postal_code}
                    <br />
                    {/* Phone Number */}
                    <span className="mt-1 block text-[12px]">
                      Tel : {order.shipping_address?.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsHistoryOrder;
