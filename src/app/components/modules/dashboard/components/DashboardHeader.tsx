'use client';

import React, { useState, useCallback } from 'react';
import {Calendar, ChevronDown, LayoutDashboard} from 'lucide-react';
import { useDashboardData } from "@/src/app/components/modules/dashboard/core/hook/useDashboardData";
import OrderStatistics  from "@/src/app/components/modules/dashboard/components/OrderStatistics";
import RevenueTrend     from "@/src/app/components/modules/dashboard/components/RevenueTrend";
import RecentOrders     from "@/src/app/components/modules/dashboard/components/RecentOrders";
import InventoryAlert   from "@/src/app/components/modules/dashboard/components/InventoryAlert";
import TopProducts      from "@/src/app/components/modules/dashboard/components/TopProducts";
import OrderStatusChart from "@/src/app/components/modules/dashboard/components/OrderStatusChart";
import TopCustomers     from "@/src/app/components/modules/dashboard/components/TopCustomers";
import Overviews         from "@/src/app/components/modules/dashboard/components/Overviews";
import CustomerStats    from "@/src/app/components/modules/dashboard/components/CustomerStats";
import DateRangePicker  from "@/src/app/components/modules/dashboard/components/DateRangePicker";
import {DashboardData} from "@/src/app/components/modules/dashboard/core/models/dashboardModel";
import {dashboardService} from "@/src/app/components/modules/dashboard/core/services/dashboardService";

const FILTERS = ['Today', 'Yesterday', 'Week', 'Month', 'Year'];
const FILTER_MAP: Record<string, string> = {
    Today: 'today', Yesterday: 'yesterday', Week: 'week', Month: 'month', Year: 'year',
};

const fmtDisplay = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

const extractDashboard = (response: any): { dashData?: DashboardData; dateRange?: { start: string; end: string } } => {
    if (!response) return {};
    const candidates = [response, response?.data, response?.data?.data];
    for (const c of candidates) {
        if (c && typeof c.total_revenue !== 'undefined') return { dashData: c };
        if (c && c.date_range && c.data?.total_revenue !== 'undefined') {
            return { dashData: c.data, dateRange: c.date_range };
        }
    }
    return {};
};

const Dashboard = () => {
    const [activeFilter, setActiveFilter] = useState('Month');
    const [showPicker, setShowPicker]     = useState(false);
    const [customStart, setCustomStart]   = useState<Date | null>(null);
    const [customEnd, setCustomEnd]       = useState<Date | null>(null);


    const fetcher = useCallback(
        async (signal?: AbortSignal) => {
            return await dashboardService.fetchDashboardData(
                FILTER_MAP[activeFilter] ?? 'month',
                signal,
                customStart ?? undefined,
                customEnd   ?? undefined,
            );
        },
        [activeFilter, customStart, customEnd]
    );


    const { data: response, loading } = useDashboardData<any>(fetcher, null as any, true);
    const { dashData, dateRange } = extractDashboard(response);

    const dateLabel = customStart && customEnd
        ? `${fmtDisplay(customStart)} — ${fmtDisplay(customEnd)}`
        : dateRange
            ? `${fmtDisplay(new Date(dateRange.start))} — ${fmtDisplay(new Date(dateRange.end))}`
            : '— —';

    const handleApply = (start: Date, end: Date) => {
        setCustomStart(start);
        setCustomEnd(end);
        setShowPicker(false);
        setActiveFilter('');
    };

    const handleFilterClick = (t: string) => {
        setCustomStart(null);
        setCustomEnd(null);
        setActiveFilter(t);
    };

    return (
        <div className="min-h-screen sm:p-6 py-4 font-sans text-slate-900 md:p-8">

            {showPicker && (
                <DateRangePicker
                    onClose={() => setShowPicker(false)}
                    onApply={handleApply}
                    initialStart={customStart ?? (dateRange ? new Date(dateRange.start) : undefined)}
                    initialEnd={customEnd     ?? (dateRange ? new Date(dateRange.end)   : undefined)}
                />
            )}

            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 sm:w-12 sm:h-12 custom-main-color-card rounded-full flex items-center justify-center custom-main-color-icon shrink-0">
                            <LayoutDashboard size={24} className="custom-main-color-icon"/>
                        </div>
                        <div>
                            <h1 className="text-[24px] md:text-[30px] font-bold text-[var(--header-text)]">Dashboard</h1>
                            <p className="text-gray-500 text-[12px] md:text-sm mt-1">Overview of your store's performance.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-20">
                    <button
                        type="button"
                        onClick={() => setShowPicker(true)}
                        className={`flex items-center justify-between sm:justify-start gap-2 card-theme px-4 py-2.5 rounded-xl border text-sm font-bold shadow-sm transition-colors
                            ${customStart ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className={customStart ? 'text-indigo-500' : 'text-emerald-500'}/>
                            <span className={`text-xs font-bold ${customStart ? 'text-indigo-600' : 'text-gray-400'}`}>
                                {dateLabel}
                            </span>
                        </div>
                        <ChevronDown size={14} className="text-slate-400"/>
                    </button>

                    <div className="card-theme p-1 rounded-xl flex overflow-x-auto no-scrollbar">
                        {FILTERS.map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => handleFilterClick(t)}
                                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-[20px] text-[10px] sm:text-[12px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    t === activeFilter
                                        ? 'custom-main-color-button text-white shadow-md'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <Overviews data={dashData} loading={loading} activeFilter={activeFilter}/>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <OrderStatistics data={dashData?.order_statistics} loading={loading}/>
                    <div className="col-span-12 lg:col-span-8">
                        <RevenueTrend data={dashData?.revenue_trend} loading={loading}/>
                    </div>
                    <div className="col-span-12 lg:col-span-8">
                        <CustomerStats data={dashData?.customer_stats} loading={loading}/>
                    </div>
                    <div className="col-span-12 lg:col-span-8">
                        <RecentOrders data={dashData?.recent_orders} loading={loading}/>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <InventoryAlert data={dashData?.inventory_alerts} loading={loading}/>
                    <TopProducts data={dashData?.top_sold_products} loading={loading}/>
                    <div className="col-span-12 lg:col-span-8">
                        <OrderStatusChart data={dashData?.order_carts} loading={loading}/>
                    </div>
                    <div className="col-span-12 lg:col-span-8 mb-4">
                        <TopCustomers data={dashData?.top_customers} loading={loading}/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;