'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    ShoppingBag,
    DollarSign,
    Tag,
    Truck,
    Calendar,
    Loader2,
    Filter, Download, BarChart3
} from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import { SalesReportResponse } from "@/src/app/components/modules/sales-reports/core/models/salesReportModel";
import {salesReportService} from "@/src/app/components/modules/sales-reports/core/services/salesReportService";
import {useSalesReportData} from "@/src/app/components/modules/sales-reports/core/hook/useSalesReportData";
import Pagination from "@/src/app/components/modules/sales-reports/components/Pagination";


const SalesReport = () => {
    const { showToast } = useAlert();

    // Dynamically calculate dynamic dates for 2026 based on real-time calendar initialization
    const currentYear = new Date().getFullYear();
    const defaultStartDate = `${currentYear}-01-01`; // First day of the current year
    const defaultEndDate = new Date().toISOString().split('T')[0]; // Today's date

    // Input state management
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);

    // Active state container targeting API pipeline dispatches safely
    const [activeStartDate, setActiveStartDate] = useState(defaultStartDate);
    const [activeEndDate, setActiveEndDate] = useState(defaultEndDate);

    // Pagination State Configuration
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const startRef = useRef<HTMLInputElement>(null);
    const endRef = useRef<HTMLInputElement>(null);


    const fetchReportData = useCallback((signal?: AbortSignal) => {
        return salesReportService.getSalesReport(activeStartDate, activeEndDate, signal);
    }, [activeStartDate, activeEndDate]);


    const { data: reportData, error, loading, refetchData } = useSalesReportData<SalesReportResponse>(
        fetchReportData,
        undefined,
        true
    );


    useEffect(() => {
        if (error) {
            showToast?.(error.message || "Failed to load sales report.", "error");
        }
    }, [error, showToast]);

    // Triggers queries securely immediately following complete state flush transitions
    useEffect(() => {
        refetchData();
    }, [activeStartDate, activeEndDate, refetchData]);


    const handleApplyFilter = () => {
        setActiveStartDate(startDate);
        setActiveEndDate(endDate);
        setCurrentPage(1); // Reset page selection on fresh data filter submission
    };

    const handleExportExcel = async () => {
        try {
            const blobData = await salesReportService.exportToExcel();
            if (blobData) {
                salesReportService.triggerDownload(blobData, `Sales_Report_${activeStartDate}_to_${activeEndDate}.xlsx`);
                showToast?.("Sale Report exported to Excel successfully!", "success");
            } else {
                showToast?.("Failed to export Excel.", "error");
            }
        } catch (error) {
            showToast?.("An error occurred during Excel export.", "error");
        }
    };

    const handlePrintPdf = async () => {
        try {
            const blobData = await salesReportService.exportToPdf();
            if (blobData) {
                salesReportService.triggerDownload(blobData, `Sales_Report_${activeStartDate}_to_${activeEndDate}.pdf`);
                showToast?.("Sale Report exported to PDF successfully!", "success");
            } else {
                showToast?.("Failed to generate PDF.", "error");
            }
        } catch (error) {
            showToast?.("An error occurred while generating PDF.", "error");
        }
    };

    const getStatusStyles = (status: string) => {
        const s = status?.toUpperCase() || '';
        switch (s) {
            case 'COMPLETED': case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PENDING': case 'CONFIRMED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'REFUNDED': return 'bg-orange-50 text-orange-500 border-orange-100';
            case 'CANCELLED': return 'bg-red-50 text-red-500 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const stats = [
        { label: 'TOTAL ORDERS', value: reportData?.stats.total_orders || '0', icon: <ShoppingBag className="text-blue-600" />, bgColor: 'bg-blue-50' },
        { label: 'TOTAL EARNINGS', value: `$${reportData?.stats.total_earnings || '0.00'}`, icon: <DollarSign className="text-emerald-600" />, bgColor: 'bg-emerald-50' },
        { label: 'TOTAL DISCOUNTS', value: `$${reportData?.stats.total_discounts || '0.00'}`, icon: <Tag className="text-orange-500" />, bgColor: 'bg-orange-50' },
        { label: 'SHIPPING CHARGES', value: `$${reportData?.stats.shipping_charges || '0.00'}`, icon: <Truck className="text-purple-600" />, bgColor: 'bg-purple-50' },
    ];

    // Compute active calculations for page limits and clean runtime slice segmentation
    const totalOrdersList = reportData?.orders || [];
    const totalOrdersCount = totalOrdersList.length;
    const totalPages = Math.ceil(totalOrdersCount / itemsPerPage) || 1;

    // Fallback checks to prevent bound-overflow on runtime state changes
    const safePage = Math.min(currentPage, totalPages) || 1;
    const indexOfLastItem = safePage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = totalOrdersList.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="min-h-screen sm:p-6 py-4 md:p-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 custom-main-color-card rounded-full flex items-center justify-center custom-main-color-icon shrink-0">
                            <BarChart3 size={24} className="custom-main-color-icon"/>
                        </div>
                        <div>
                            <h1 className="text-[24px] md:text-[30px] font-bold text-[var(--header-text)]">Sales Report</h1>
                            <p className="text-gray-500 text-[12px] md:text-sm mt-1">Analyze your revenue and order performance</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 card-theme px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-600 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
                        <Calendar
                            className="text-emerald-600 cursor-pointer"
                            size={16}
                            onClick={() => startRef.current?.showPicker()}
                        />
                        <input
                            ref={startRef}
                            type="date"
                            className="outline-none border-none bg-transparent w-28 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                        />
                        <span className="text-slate-300">|</span>
                        <Calendar
                            className="text-emerald-600 cursor-pointer"
                            size={16}
                            onClick={() => endRef.current?.showPicker()}
                        />
                        <input
                            ref={endRef}
                            type="date"
                            className="outline-none border-none bg-transparent w-28 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                        />
                    </div>

                    <button
                        onClick={handleApplyFilter}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-2 sm:px-4 py-2.5 custom-main-color-button-hover custom-main-color-button text-white rounded-full text-xs font-bold transition-all shadow-sm whitespace-nowrap cursor-pointer"
                    >
                        <Filter size={16}/>
                        FILTER
                    </button>

                    <button
                        onClick={handleExportExcel}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-2 sm:px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs font-bold transition-all shadow-sm whitespace-nowrap cursor-pointer disabled:opacity-50">
                        <Download size={16}/>Export Excel
                    </button>
                    <button
                        onClick={handlePrintPdf}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 card-theme text-[var(--header-text)] px-2 sm:px-4 py-2.5 rounded-full text-xs font-bold hover:bg-gray-50 transition whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                        <Download size={16}/>
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx}
                         className="card-theme p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <div
                            className={`w-12 h-12 sm:w-12 sm:h-12 ${stat.bgColor} rounded-full flex items-center justify-center mb-4`}>
                            {stat.icon}
                        </div>
                        <p className="text-xs font-bold text-slate-400 tracking-wider mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-[var(--header-text)]">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div
                className="card-theme rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative min-h-[400px]">
                {loading && (
                    <div
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center transition-all">
                        <Loader2 className="animate-spin custom-main-color-icon" size={35}/>
                    </div>
                )}

                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h2 className="font-bold text-[var(--header-text)] text-[24px] sm:text-[30px]">Detailed Orders</h2>
                    </div>
                </div>

                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                        <tr className="text-[14px] font-bold text-[var(--header-text)] bg-gray-50/50">
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Discount</th>
                            <th className="px-6 py-4">Shipping</th>
                            <th className="px-6 py-4">Payment</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                        {currentOrders.length > 0 ? (
                            currentOrders.map((order, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
                                    <td className="px-6 py-5 text-[13px] sm:text-[15px] md:text-[16px] font-black text-[var(--header-text)]">{order.order_id}</td>
                                    <td className="px-6 py-5 text-sm text-[var(--header-text)] font-medium">{order.date}</td>
                                    <td className="px-6 py-5 text-sm font-bold text-[var(--header-text)]">${order.total}</td>
                                    <td className="px-6 py-5 text-sm text-emerald-500 font-bold">${order.discount}</td>
                                    <td className="px-6 py-5 text-sm text-red-500 font-bold">${order.shipping}</td>
                                    <td className="px-6 py-5">
                                        <div className="text-sm font-bold text-[var(--header-text)] leading-tight">{order.payment?.method || 'N/A'}</div>
                                        <div className={`text-[10px] font-bold uppercase tracking-tighter ${order.payment?.status === 'paid' ? 'text-emerald-500' : 'text-orange-400'}`}>
                                            {order.payment?.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className={`px-3 py-1 sm:px-3 sm:py-1.5 border rounded-full text-[10px] font-bold uppercase ${getStatusStyles(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            !loading && (
                                <tr>
                                    <td colSpan={7}>
                                        <div
                                            className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                                            <BarChart3 className="w-12 h-12 text-gray-300"/>
                                            <span> No sales report found.</span>
                                        </div>
                                    </td>
                                </tr>
                            )
                        )}
                        </tbody>
                    </table>
                </div>

                {/* BOTTOM PACK (Using proper totalOrdersCount data metrics) */}
                {!loading && totalOrdersCount > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 gap-4 border-t border-slate-50/50">
                        <div className="text-sm text-gray-500 font-medium">
                            Total items: <span className="font-bold text-emerald-500">{totalOrdersCount}</span><span className="px-1">Sales Reports</span>
                        </div>
                        {totalOrdersCount > itemsPerPage && (
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

export default SalesReport;