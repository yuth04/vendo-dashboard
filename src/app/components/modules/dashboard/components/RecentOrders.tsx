"use client";

import React from 'react';
import {ShoppingCart, Loader2, User, Calendar, Clock} from 'lucide-react';
import { useRouter } from "next/navigation";
import {RecentOrder} from "@/src/app/components/modules/dashboard/core/models/dashboardModel";


interface Props {
    data?: RecentOrder[];
    loading?: boolean;
}

const statusStyles: Record<string, string> = {
    completed:      "bg-emerald-100 text-emerald-600",
    delivered:      "bg-blue-100 text-blue-600",
    shipping:       "bg-cyan-100 text-cyan-600",
    confirmed:      "bg-indigo-100 text-indigo-600",
    pending:        "bg-orange-100 text-orange-600",
    cancelled:      "bg-red-100 text-red-600",
    returned:       "bg-slate-100 text-slate-600",
    return_pending: "bg-yellow-100 text-yellow-600",
};

const RecentOrders: React.FC<Props> = ({ data = [], loading }) => {
    const router = useRouter();

    return (
        <div className="card-theme p-6 rounded-[2rem] border border-slate-100 shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[var(--header-text)] font-bold text-[18px] sm:text-[20px]">Recent Orders</h3>
                <div className="flex items-center gap-2">
                    {loading && <Loader2 size={14} className="animate-spin text-slate-400" />}
                    <button
                        onClick={() => router.push("/admin/online-orders")}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline cursor-pointer">
                        View All
                    </button>
                </div>
            </div>

            {!loading && data.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No recent orders</p>
            ) : (
                <div className="space-y-6 sm:space-y-5">
                    {data.map((order) => (
                        <div
                            key={order.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between group cursor-pointer py-1 gap-3 sm:gap-0"
                        >
                            <div className="flex items-center gap-4">
                                <div className="custom-main-color-card p-2.5 rounded-full custom-main-color-button-hover transition-colors shadow-sm shrink-0">
                                    <ShoppingCart size={18} className="custom-main-color-icon" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-black text-[var(--header-text)] tracking-tight">
                                        {order.order_number}
                                    </h4>
                                    <div
                                        className="text-[11px] sm:text-[12px] font-bold text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                                        <div className="flex items-center gap-1">
                                            <User size={12} className="text-gray-400 shrink-0"/>
                                            <span className="truncate max-w-[100px] sm:max-w-none">
                                                {order.first_name} {order.last_name}
                                            </span>
                                        </div>
                                        <div
                                            className="flex flex-wrap items-center gap-2 mt-1 text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} className="text-gray-400"/>
                                                <span
                                                    className="text-[11px] sm:text-[12px] font-bold">{order.ordered_date}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} className="text-gray-400"/>
                                                <span
                                                    className="text-[11px] sm:text-[12px] font-bold">{order.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-b border-gray-200 py-2 sm:border-0 pt-2 sm:pt-0">
                                <p className="text-sm font-black text-[var(--header-text)] sm:mb-1">
                                    ${parseFloat(order.total_price).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                </p>
                                <span
                                    className={`text-[9px] sm:text-[10px] font-black px-2 py-1.5 rounded-[20px] tracking-wider uppercase whitespace-nowrap ${statusStyles[order.status] ?? 'bg-slate-100 text-slate-500'}`}>
                                    {order.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentOrders;