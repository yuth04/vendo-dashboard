'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Box,
    Layers,
    TrendingUp,
    Calendar,
    Loader2,
    DollarSign, Download, Filter, PackageSearch
} from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import { ProductReportResponse } from "@/src/app/components/modules/product-reports/core/models/productReportModel";
import {useProductReportData} from "@/src/app/components/modules/product-reports/core/hook/useProductReportData";
import {productReportService} from "@/src/app/components/modules/product-reports/core/services/productReportService";
import Pagination from "@/src/app/components/modules/product-reports/components/Pagination";


const ProductsReports = () => {
    const { showToast } = useAlert();

    // Dynamically calculate default dates based on the current year/date
    const currentYear = new Date().getFullYear();
    const defaultStartDate = `${currentYear}-01-01`; // First day of the current year
    const defaultEndDate = new Date().toISOString().split('T')[0]; // Current today's date

    // Input state management
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);

    // Active state used to make requests (fixes stale data/race condition bugs)
    const [activeStartDate, setActiveStartDate] = useState(defaultStartDate);
    const [activeEndDate, setActiveEndDate] = useState(defaultEndDate);

    // Pagination State Configuration
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const startRef = useRef<HTMLInputElement>(null);
    const endRef = useRef<HTMLInputElement>(null);


    const fetchReportData = useCallback((signal?: AbortSignal) => {
        return productReportService.getProductReport(activeStartDate, activeEndDate, signal);
    }, [activeStartDate, activeEndDate]);

    const { data: reportData, error, loading, refetchData } = useProductReportData<ProductReportResponse>(
        fetchReportData,
        undefined,
        true
    );


    useEffect(() => {
        if (error) {
            showToast?.(error.message || "Failed to load product report.", "error");
        }
    }, [error, showToast]);

    // Refetch automatically whenever active filters change to prevent async state race condition
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
            const blobData = await productReportService.exportToExcel();
            if (blobData) {
                productReportService.downloadFile(blobData as Blob, `Product_Report_${activeStartDate}_to_${activeEndDate}.xlsx`);
                showToast?.("Product Report exported to Excel successfully!", "success");
            } else {
                showToast?.("Failed to export Excel report", "error");
            }
        } catch (error) {
            showToast?.("Failed to export Excel report", "error");
        }
    };

    const handleExportPdf = async () => {
        try {
            const blobData = await productReportService.exportToPdf();
            if (blobData) {
                productReportService.downloadFile(blobData as Blob, `Product_Report_${activeStartDate}_to_${activeEndDate}.pdf`);
                showToast?.("Product Report exported to PDF successfully!", "success");
            } else {
                showToast?.("Failed to export PDF report", "error");
            }
        } catch (error) {
            showToast?.("Failed to export PDF report", "error");
        }
    };

    const stats = [
        { label: 'TOTAL PRODUCTS', value: reportData?.stats.total_product || 0, icon: <Box size={20} className="text-blue-500" />, bgColor: 'bg-blue-50' },
        { label: 'TOTAL CATEGORIES', value: reportData?.stats.total_categories || 0, icon: <Layers size={20} className="text-purple-500" />, bgColor: 'bg-purple-50' },
        { label: 'TOTAL SOLD QUANTITY', value: reportData?.stats.total_quantity_sold || 0, icon: <TrendingUp size={20} className="text-emerald-500" />, bgColor: 'bg-emerald-50' },
        { label: 'TOTAL REVENUE', value: `$${reportData?.stats.total_revenue || '0.00'}`, icon: <DollarSign size={20} className="text-orange-500" />, bgColor: 'bg-orange-50' },
    ];

    // Compute active calculations for page limits and clean runtime slice segmentation
    const totalProductsList = reportData?.products || [];
    const totalProductsCount = totalProductsList.length;
    const totalPages = Math.ceil(totalProductsCount / itemsPerPage) || 1;

    // Fallback checks to prevent bound-overflow on runtime state changes
    const safePage = Math.min(currentPage, totalPages) || 1;
    const indexOfLastItem = safePage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = totalProductsList.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="min-h-screen sm:p-6 py-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 sm:w-12 sm:h-12 custom-main-color-card rounded-full flex items-center justify-center custom-main-color-icon shrink-0">
                            <PackageSearch size={24} className="custom-main-color-icon"/>
                        </div>
                        <div>
                            <h1 className="text-[24px] md:text-[30px] font-bold text-[var(--header-text)]">Products Report</h1>
                            <p className="text-gray-500 text-[12px] md:text-sm mt-1">Track your best performing items and categories</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 card-theme px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-600 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
                        <Calendar
                            size={16}
                            className="text-emerald-600 cursor-pointer"
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
                            size={16}
                            className="text-emerald-600 cursor-pointer"
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
                        <Download size={16}/>
                        Export Excel
                    </button>
                    <button
                        onClick={handleExportPdf}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 card-theme text-[var(--header-text)] px-2 sm:px-4 py-2.5 rounded-full text-xs font-bold hover:bg-gray-50 transition whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                        <Download size={16}/>
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx}
                         className="card-theme p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center mb-6`}>
                            {stat.icon}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest mb-2 uppercase">{stat.label}</p>
                        <p className="text-3xl font-black text-[var(--header-text)]">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Performance Table */}
            <div className="card-theme rounded-[32px] shadow-sm border border-slate-100 overflow-hidden relative min-h-[300px]">
                {loading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center transition-all">
                        <Loader2 className="animate-spin custom-main-color-icon" size={35}/>
                    </div>
                )}

                <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                    <h2 className="font-black text-[var(--header-text)] text-[24px] md:text-[30px] ">Product Performance</h2>
                </div>

                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                        <tr className="text-[14px] font-bold text-[var(--header-text)] bg-gray-50/50">
                            <th className="px-8 py-5">Product Name</th>
                            <th className="px-8 py-5">Category</th>
                            <th className="px-8 py-5 text-center">Sold Quantity</th>
                            <th className="px-8 py-5 w-64">Popular Products</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                        {currentProducts.length > 0 ? (
                            currentProducts.map((item, idx) => {
                                const totalSold = reportData?.stats.total_quantity_sold || 1;
                                const share = (item.total_quantity / totalSold) * 100;

                                return (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors whitespace-nowrap">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image} alt={item.product_name} className="w-12 h-12 rounded-lg object-contain bg-slate-100" />
                                                <div>
                                                    <div className="text-sm font-black text-[var(--header-text)]">{item.product_name}</div>
                                                    <div className="text-[10px] text-[var(--header-text)] font-bold uppercase">{item.variant.size} / {item.variant.color}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold tracking-tighter uppercase">
                                              {item.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center text-sm font-black text-[var(--header-text)]">
                                            {item.total_quantity}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="flex-1 h-2 card-theme rounded-full overflow-hidden min-w-[100px]">
                                                    <div
                                                        className="h-full bg-blue-500 border-blue-500 rounded-full"
                                                        style={{width: `${share}%`}}
                                                    ></div>
                                                </div>
                                                <span className="text-[12px] font-bold text-[var(--header-text)] w-12 text-right">
                                                    {share.toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            !loading && (
                                <tr>
                                    <td colSpan={4}>
                                        <div
                                            className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                                            <PackageSearch className="w-12 h-12 text-gray-300"/>
                                            <span>No products report found.</span>
                                        </div>
                                    </td>
                                </tr>
                            )
                        )}
                        </tbody>
                    </table>
                </div>

                {/* BOTTOM PACK (Using correct totalProductsCount tracking variables) */}
                {!loading && totalProductsCount > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 gap-4 border-t border-slate-50/50">
                        <div className="text-sm text-gray-500 font-medium">
                            Total items: <span className="font-bold text-emerald-500">{totalProductsCount}</span><span className="px-1">Product Reports</span>
                        </div>
                        {totalProductsCount > itemsPerPage && (
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

export default ProductsReports;