'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus, Search, Filter, Edit3, Download, PackageX,
    ChevronDown, Loader2, Calendar, Clock, Trash2, ImageOff
} from 'lucide-react';
import AddProductDamage from './AddProductDamage';
import EditProductDamage from './EditProductDamage';
import { useAlert } from "@/src/app/components/context/AlertContext";
import { DamageItem } from "@/src/app/components/modules/damage/core/models/damageModel";
import { damageService } from "@/src/app/components/modules/damage/core/services/damageService";
import { useDamageData } from "@/src/app/components/modules/damage/core/hook/useDamageData";
import Pagination from "@/src/app/components/modules/damage/components/Pagination";

const ITEMS_PER_PAGE = 8;
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

function imgUrl(path: string | null | undefined): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${BASE}${path}`;
}

function getProofUrl(item: DamageItem): string {
    const data = item as any;
    const raw = data.image_proof ?? data.proof_image ?? data.proof ?? data.image ?? null;
    return imgUrl(raw);
}

const Damage = () => {
    const { showToast, showConfirm } = useAlert();
    const [damageData, setDamageData] = useState<DamageItem[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<DamageItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [currentPage, setCurrentPage] = useState(1);

    const { data: fetchedPayload, loading, refetchData } = useDamageData(
        damageService.fetchProductDamages,
        null,
        true
    );

    //--- ROLE PROTECTION SETUP ---//
    const userRole = (() => {
        if (typeof window === 'undefined') return null;
        try {
            const raw = localStorage.getItem('auth_user');
            return raw ? JSON.parse(raw)?.role ?? null : null;
        } catch {
            return null;
        }
    })();
    const isStaff = userRole === 'staff';

    useEffect(() => {
        if (fetchedPayload?.data) {
            if (fetchedPayload.data.length > 0) {
                console.log('[DEBUG] full first item:', JSON.stringify(fetchedPayload.data[0], null, 2));
            }
            setDamageData(fetchedPayload.data);
        }
    }, [fetchedPayload]);

    const handleExport = async (type: 'excel' | 'pdf') => {
        try {
            const response = type === 'excel'
                ? await damageService.exportProductDamages()
                : await damageService.exportProductDamagesPdf();

            if (response?.data) {
                const blob = new Blob([response.data as any], {
                    type: type === 'excel'
                        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        : 'application/pdf'
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `damages_report_${Date.now()}.${type === 'excel' ? 'xlsx' : 'pdf'}`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                showToast(`Damages exported to ${type.toUpperCase()} successfully`, "success");
            } else if (response?.error) {
                showToast(response.error.message || "Failed to export file", "error");
            }
        } catch (error) {
            showToast("Failed to export file", "error");
        }
    };

    const handleOpenEdit = (item: DamageItem) => {
        if (isStaff) {
            showToast("Only super-admin and admin can edit product damage.", "error");
            return;
        }
        setEditingItem(item);
    };

    const handleDelete = async (id: number | string) => {
        if (isStaff) {
            showToast("Only super-admin and admin can delete product damage.", "error");
            return;
        }

        const confirmed = await showConfirm({
            title: "Delete Report",
            message: "Are you sure you want to delete this report? This action cannot be undone.",
            variant: "danger",
            confirmLabel: "Delete"
        });
        if (!confirmed) return;
        try {
            const response = await damageService.deleteProductDamage(id);
            if (!response.error) {
                showToast("Record deleted successfully.", "success");
                setDamageData(prev => prev.filter(d => d.id !== id));
                refetchData();
            } else {
                showToast(response.error.message || "Failed to delete record.", "error");
            }
        } catch {
            showToast("Failed to delete record.", "error");
        }
    };

    const handleUpdateSuccess = (updatedItem: DamageItem) => {
        setDamageData(prev => prev.map(d => d.id === updatedItem.id ? { ...d, ...updatedItem } : d));
        setEditingItem(null);
    };

    const handleAddSuccess = () => {
        refetchData();
        setIsAddModalOpen(false);
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':   return 'bg-orange-50 text-orange-400 border-orange-100';
            case 'resolved':  return 'bg-emerald-50 text-emerald-500 border-emerald-100';
            case 'discarded': return 'bg-red-50 text-red-400 border-red-100';
            default:          return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    };

    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

    const filteredData = useMemo(() => damageData.filter((item) => {
        if (!item?.product) return false;
        const matchesSearch = (item.product.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || (item.status || "").toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    }), [damageData, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const safePage = Math.max(1, Math.min(currentPage, totalPages));

    const paginatedData = useMemo(() => {
        const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredData, safePage]);

    return (
        <div className="min-h-screen sm:p-6 py-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 custom-main-color-card rounded-full flex items-center justify-center shrink-0">
                        <PackageX size={24} className="custom-main-color-icon" />
                    </div>
                    <div>
                        <h1 className="text-[24px] md:text-[30px] font-bold text-[var(--header-text)]">Product Damages</h1>
                        <p className="text-gray-500 text-[12px] md:text-sm mt-1">Track and manage damaged inventory.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <button onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 custom-main-color-button custom-main-color-button-hover text-white rounded-full sm:text-[14px] text-[12px] font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap">
                        <Plus size={16} strokeWidth={3} /> Add Product Damage
                    </button>
                    <button onClick={() => handleExport('excel')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full sm:text-[14px] text-[12px] font-bold transition-all shadow-sm whitespace-nowrap cursor-pointer">
                        <Download size={16} /> Export Excel
                    </button>
                    <button onClick={() => handleExport('pdf')}
                            className="flex items-center gap-2 card-theme text-[var(--header-text)] px-4 py-2.5 rounded-full sm:text-[14px] text-[12px] font-bold hover:bg-gray-50 transition whitespace-nowrap cursor-pointer">
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="mb-6 card-theme rounded-[20px] p-3 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Search by product name..." value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full pl-12 pr-4 py-3 input-theme rounded-[20px] focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-base shadow-sm" />
                </div>
                <div className="relative min-w-[180px]">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full appearance-none pl-11 pr-10 py-3 card-theme rounded-[20px] text-base font-bold text-slate-500 outline-none cursor-pointer shadow-sm">
                        <option value="All Status">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Discarded">Discarded</option>
                    </select>
                    <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Table */}
            <div className="card-theme rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                        <tr className="sm:text-[14px] text-[12px] font-bold text-[var(--header-text)] bg-gray-50/50">
                            <th className="px-4 py-5 sm:px-8">Product</th>
                            <th className="px-4 py-5 sm:px-8">Reason</th>
                            <th className="px-4 py-5 sm:px-8 text-center">Quantity</th>
                            <th className="px-4 py-5 sm:px-8">Current Stock</th>
                            <th className="px-4 py-5 sm:px-8">Status</th>
                            <th className="px-4 py-5 sm:px-8">Proof</th>
                            <th className="px-4 py-5 sm:px-8">Reported By</th>
                            <th className="px-4 py-5 sm:px-8 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                        {loading && damageData.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-32">
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="animate-spin custom-main-color-icon" size={32} />
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((item) => {
                                const proofUrl  = getProofUrl(item);
                                const productImgUrl = imgUrl(item.product.image);

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors whitespace-nowrap">
                                        {/* Product */}
                                        <td className="px-4 py-6 sm:px-8">
                                            <div className="flex items-center gap-3">
                                                <div className="sm:w-12 sm:h-12 w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center overflow-hidden shrink-0">
                                                    <img src={productImgUrl} alt={item.product.name} className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-[var(--header-text)] leading-tight">{item.product.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold tracking-tighter mt-0.5 uppercase">{item.product.slug}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Reason */}
                                        <td className="px-4 py-6 sm:px-8 text-sm text-gray-400 font-medium">{item.reason}</td>

                                        {/* Quantity */}
                                        <td className="px-4 py-6 sm:px-8 text-center text-sm font-black text-[var(--header-text)]">{item.quantity}</td>

                                        {/* Current Stock */}
                                        <td className="px-4 py-6 sm:px-8">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span className="text-sm font-black text-[var(--header-text)]">{item.current_stock}</span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-6 sm:px-8">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${getStatusStyle(item.status)}`}>
                                                    {item.status}
                                                </span>
                                        </td>

                                        <td className="px-4 py-6 sm:px-8">
                                            {proofUrl ? (
                                                <a href={proofUrl} target="_blank" rel="noopener noreferrer">
                                                    <img src={proofUrl} alt="proof"
                                                         className="w-12 h-12 rounded-xl object-center object-contain border border-slate-100 hover:scale-110 transition-transform cursor-pointer" />
                                                </a>
                                            ) : (
                                                <span
                                                    className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
                                                    <ImageOff size={16}/>
                                                    No proof
                                                    </span>
                                            )}
                                        </td>

                                        {/* Reported By */}
                                        <td className="px-4 py-6 sm:px-8">
                                            <div className="text-[12px] font-bold text-[var(--header-text)] leading-tight">
                                                {item.reported_by.first_name} {item.reported_by.last_name}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    <span className="text-[11px] sm:text-[12px] font-bold">{item.reported_by.date}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    <span className="text-[11px] sm:text-[12px] font-bold">{item.reported_by.time}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-6 sm:px-8 text-right">
                                            <button onClick={() => handleOpenEdit(item)}
                                                    className={`p-2 rounded-full transition-colors ${
                                                        isStaff ? 'text-gray-300 cursor-not-allowed opacity-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer'
                                                    }`}>
                                                <Edit3 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)}
                                                    className={`p-2 rounded-full transition-colors ${
                                                        isStaff ? 'text-gray-300 cursor-not-allowed opacity-50' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer'
                                                    }`}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={8}>
                                    <div className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                                        <PackageX className="w-12 h-12 text-gray-300" />
                                        <span>No products damage found.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* BOTTOM PACK (Total Items & Pagination) */}
                {filteredData.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 gap-4 border-t border-slate-50/50">
                        <div className="text-sm text-gray-500 font-medium">
                            Total items: <span className="font-bold text-emerald-500">{filteredData.length}</span>
                            <span className="px-1">Product Damages</span>
                        </div>

                        {/* Only render Pagination if total items exceed ITEMS_PER_PAGE */}
                        {filteredData.length > ITEMS_PER_PAGE && (
                            <Pagination
                                currentPage={safePage}
                                totalPages={Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                )}

            </div>

            {isAddModalOpen && (
                <AddProductDamage onClose={() => setIsAddModalOpen(false)} onSuccess={handleAddSuccess} />
            )}
            {editingItem && (
                <EditProductDamage item={editingItem} onClose={() => setEditingItem(null)} onSuccess={handleUpdateSuccess} />
            )}
        </div>
    );
};

export default Damage;