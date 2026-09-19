"use client";

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
    Search, Filter, Download, Printer, Eye, CheckCircle, XCircle, Undo2, Loader2, ChevronDown, Calendar, Clock
} from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import { ReturnItem } from "@/src/app/components/modules/customer-return/core/models/customerReturnModel";
import { customerrturnClient } from "@/src/app/components/modules/customer-return/core/api/customerReturnClient";
import { customerReturnService } from "@/src/app/components/modules/customer-return/core/services/customerReturnService";
import {useCustomerReturnData} from "@/src/app/components/modules/customer-return/core/hook/useCustomerReturnData";
import Pagination from "@/src/app/components/modules/customer-return/components/Pagination";

const CustomerReturn = () => {
    const { showToast } = useAlert();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'APPROVED' | 'REFUNDED' | 'REJECTED'>('APPROVED');
    const [selectedItem, setSelectedItem] = useState<ReturnItem | null>(null);
    const [isUpdating, setIsUpdating] = useState(false); // Added loading state

    const [brokenImages, setBrokenImages] = useState<Record<string | number, boolean>>({});

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchReturnsApi = useCallback(async (signal?: AbortSignal) => {
        const response = await customerrturnClient.fetchCustomerReturn(signal);
        return {
            ...response,
            data: response?.data?.data ?? []
        } as any;
    }, []);

    const {
        data: returns,
        loading,
        refetchData
    } = useCustomerReturnData<ReturnItem[]>(fetchReturnsApi, [], true);

    const handleExport = async (type: 'excel' | 'pdf') => {
        try {
            const response = type === 'excel'
                ? await customerrturnClient.exportReturnHistory()
                : await customerrturnClient.exportReturnHistoryPdf();

            if (response?.data) {
                const blobType = customerReturnService.getExportBlobType(type);
                const blob = new Blob([response.data as any], { type: blobType });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `returns_history_${new Date().getTime()}.${type === 'excel' ? 'xlsx' : 'pdf'}`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                showToast(`Returns exported to ${type.toUpperCase()} successfully`, "success");
            }
        } catch (error) {
            console.error("Export error:", error);
            showToast("Failed to export file", "error");
        }
    };

    const filteredReturns = useMemo(() => {
        return customerReturnService.filterReturns(returns ?? [], searchTerm, statusFilter);
    }, [returns, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
    const safePage = Math.min(currentPage, totalPages || 1);

    const paginatedReturns = useMemo(() => {
        const startIndex = (safePage - 1) * itemsPerPage;
        return filteredReturns.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredReturns, safePage]);

    const handleOpenModal = (item: ReturnItem, type: 'APPROVED' | 'REFUNDED' | 'REJECTED') => {
        setSelectedItem(item);
        setModalType(type);
        setShowModal(true);
    };

    const handleConfirmUpdate = async () => {
        if (!selectedItem) return;
        setIsUpdating(true);

        try {
            if (modalType === 'APPROVED') {
                await customerrturnClient.approveReturn(selectedItem.id);
            } else if (modalType === 'REFUNDED') {
                await customerrturnClient.completeReturn(selectedItem.id);
            } else if (modalType === 'REJECTED') {
                await customerrturnClient.rejectReturn(selectedItem.id);
            }

            showToast(`Return marked as ${modalType.toLowerCase()} successfully`, "success");
            setShowModal(false);
            refetchData();
        } catch (error) {
            console.error("Update failed:", error);
            showToast("Failed to update status", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="sm:p-6 py-4 md:p-8 min-h-screen font-sans text-gray-800">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 sm:w-12 sm:h-12 custom-main-color-card rounded-full flex items-center justify-center custom-main-color-icon shrink-0">
                            <Undo2 size={24} className="custom-main-color-icon"/>
                        </div>
                        <div>
                            <h1 className="text-[24px] md:text-[30px] font-bold text-[var(--header-text)]"> Customer Returns</h1>
                            <p className="text-gray-500 text-[12px] md:text-sm mt-1">Manage product returns and refund requests.</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <button
                        onClick={() => handleExport('excel')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full sm:text-[14px] text-[12px] font-bold transition-all shadow-sm whitespace-nowrap disabled:opacity-50 cursor-pointer">
                        <Download size={16}/>Export Excel
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        className="flex items-center gap-2 card-theme text-[var(--header-text)] px-4 py-2.5 rounded-full sm:text-[14px] text-[12px] font-bold hover:bg-gray-50 transition whitespace-nowrap cursor-pointer">
                        <Download size={16}/>Export PDF
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div
                className="mb-6 card-theme rounded-[20px] p-3 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input
                        type="text"
                        placeholder="Search order by name or email..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-12 pr-4 py-3 input-theme rounded-[20px] focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-base shadow-sm"
                    />
                </div>
                <div className="relative w-full md:w-48">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full appearance-none pl-11 pr-10 py-3 card-theme rounded-[20px] text-base font-bold text-slate-500 outline-none cursor-pointer shadow-sm"
                    >
                        <option value="All Status">All Status</option>
                        <option value="requested">Requested</option>
                        <option value="approved">Approved</option>
                        <option value="refunded">Refunded</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <ChevronDown size={16}
                                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                </div>
            </div>

            {/* Table Section */}
            <div className="card-theme rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                        <tr className="bg-gray-50/30 text-[14px] text-[var(--header-text)]">
                            <th className="px-6 py-4 font-bold ">Request Date</th>
                            <th className="px-6 py-4 font-bold ">Order #</th>
                            <th className="px-6 py-4 font-bold ">Customer</th>
                            <th className="px-6 py-4 font-bold ">Reason</th>
                            <th className="px-6 py-4 font-bold ">Status</th>
                            <th className="px-6 py-4 font-bold text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center">
                                    <div className="flex flex-col items-center justify-center py-32 gap-3">
                                        <Loader2 className="animate-spin custom-main-color-icon" size={32}/>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedReturns.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
                                    <div
                                        className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                                        <Undo2 className="w-12 h-12 text-gray-300"/>
                                        <span> No return requests found.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedReturns.map((item, idx) => {
                                const rowKey = item.id || idx;
                                const hasValidAvatar = item.avatar && !brokenImages[rowKey];
                                const firstLetter = item.first_name ? item.first_name.charAt(0).toUpperCase() : '?';

                                return (
                                    <tr key={rowKey} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-gray-400 whitespace-nowrap">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={12} className="text-[var(--header-text)]"/>
                                                        <span className="text-[12px] sm:text-[14px] font-semibold text-[var(--header-text)]">
                                                          {item.date || ''}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={12} className="text-[var(--header-text)]"/>
                                                        <span className="text-[12px] sm:text-[14px] font-semibold text-[var(--header-text)]">
                                                          {item.time || ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-black text-[var(--header-text)] whitespace-nowrap"># {item.order_number || ''}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {hasValidAvatar ? (
                                                    <img
                                                        src={item.avatar || ''}
                                                        className="w-8 h-8 rounded-full object-cover shrink-0"
                                                        alt=""
                                                        onError={() => setBrokenImages(prev => ({ ...prev, [rowKey]: true }))}
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold bg-gray-400">
                                                        {firstLetter}
                                                    </div>
                                                )}
                                                <div className="min-w-0 overflow-hidden">
                                                    <div className="text-sm font-black text-[var(--header-text)] truncate">{`${item.first_name || ''} ${item.last_name || ''}`}</div>
                                                    <div className="text-xs text-[var(--header-text)] truncate">{item.email || ''}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-[var(--header-text)] font-medium truncate max-w-[150px]">{item.reason || ''}</div>
                                            <div className="text-xs text-gray-400 truncate max-w-[150px]">{item.note || ''}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1.5 sm:px-3 sm:py-1.5 border rounded-full text-[10px] font-bold tracking-wide uppercase whitespace-nowrap ${customerReturnService.getStatusStyles(item.status || '')}`}>
                                                    {item.status || ''}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 text-gray-400">
                                                <Link href={`/admin/customer-return/${item.id}`}>
                                                    <button className="p-1.5 hover:text-blue-500 cursor-pointer transition-colors"><Eye size={18}/>
                                                    </button>
                                                </Link>
                                                <button className="p-1.5 hover:text-gray-600 transition-colors"><Printer size={18}/></button>

                                                {item.status === 'requested' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleOpenModal(item, 'APPROVED')}
                                                            className="p-1.5 text-emerald-500 hover:text-cyan-600 cursor-pointer transition-colors">
                                                            <CheckCircle size={18}/>
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenModal(item, 'REJECTED')}
                                                            className="p-1.5 text-red-400 hover:text-red-500 cursor-pointer transition-colors">
                                                            <XCircle size={18}/>
                                                        </button>
                                                    </>
                                                )}
                                                {item.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleOpenModal(item, 'REFUNDED')}
                                                        className="p-1.5 text-emerald-500 hover:text-emerald-600 cursor-pointer transition-colors">
                                                        <CheckCircle size={18}/>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Bottom navigation layout wrapper matching your pattern */}
                {!loading && filteredReturns.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 gap-4 border-t border-gray-50/50">
                        <div className="text-sm text-gray-500 font-medium">
                            Total items: <span className="font-bold text-emerald-500">{filteredReturns.length}</span><span className="px-1">Returns</span>
                        </div>
                        <Pagination
                            currentPage={safePage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="card-theme rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-xl text-center">
                        <div className="flex justify-center mb-4">
                            <div
                                className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                                <CheckCircle className="text-gray-400" size={32}/>
                            </div>
                        </div>
                        <h2 className="text-[18px] md:text-[20px] font-bold mb-2 text-[var(--header-text)]">Update Status</h2>
                        <p className="text-gray-500 text-sm mb-8 px-2">
                            Are you sure you want to mark this return as <span className="font-bold text-cyan-500">{modalType}</span>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={isUpdating}
                                className="flex-1 px-4 py-3 text-[11px] md:text-[12px] font-black text-gray-400 card-theme rounded-[18px] tracking-widest hover:text-gray-600 transition-colors cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmUpdate}
                                disabled={isUpdating}
                                className="flex-[1.5] items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-xs md:text-sm active:scale-95 cursor-pointer bg-cyan-400 text-white font-bold hover:bg-cyan-500 transition shadow-lg flex disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Updating...
                                    </>
                                ) : (
                                    "Yes, Update"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerReturn;