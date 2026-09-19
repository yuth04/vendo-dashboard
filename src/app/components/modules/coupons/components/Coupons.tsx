"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    BadgePercent,
    Calendar,
    ShieldCheck,
    ShieldAlert,
    Eye, Filter, ChevronDown,
} from "lucide-react";
import AddCoupon from "@/src/app/components/modules/coupons/components/AddCoupons";
import EditCoupons from "@/src/app/components/modules/coupons/components/EditCoupons";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { useRouter } from "next/navigation";
import { Coupon } from "@/src/app/components/modules/coupons/core/models/couponModel";
import { couponService } from "@/src/app/components/modules/coupons/core/services/couponService";
import { useCouponsData } from "@/src/app/components/modules/coupons/core/hook/useCouponsData";
import Pagination from "@/src/app/components/modules/coupons/components/Pagination";

const ITEMS_PER_PAGE = 8;

const Coupons = () => {
    const { showToast, showConfirm } = useAlert();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    const { data: fetchedData, loading, refetchData } = useCouponsData(
        couponService.fetchCoupons,
        [],
        true
    );

    useEffect(() => {
        if (fetchedData) {
            setCoupons(fetchedData);
        }
    }, [fetchedData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

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

    const filteredCoupons = useMemo(() => {
        return coupons.filter((coupon) => {
            const matchesSearch = coupon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                coupon.code.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "All Status" ||
                coupon.status.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [coupons, searchQuery, statusFilter]);

    const totalPages = Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE);
    const safePage = Math.max(1, Math.min(currentPage, totalPages));

    const paginatedCoupons = useMemo(() => {
        const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
        return filteredCoupons.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredCoupons, safePage]);

    const handleAddCouponClick = () => {
        if (isStaff) {
            showToast("Only super-admin and admin can add coupons.", "error");
            return;
        }
        setIsAddModalOpen(true);
    };

    const handleToggleStatus = async (coupon: Coupon) => {
        if (isStaff) return;

        const newStatus = coupon.status === 'active' ? 'inactive' : 'active';

        const confirmed = await showConfirm({
            title: "Change Status",
            message: `Are you sure you want to change the status of "${coupon.name}" to ${newStatus}?`,
            confirmLabel: "Change Status",
            variant: "warning"
        });

        if (!confirmed) return;

        setStatusLoadingId(coupon.id);

        try {
            const formData = new FormData();
            Object.entries(coupon).forEach(([key, value]) => {
                if (key === 'image') return;

                if (key === 'status') {
                    formData.append(key, newStatus);
                } else if (value !== null && value !== undefined) {
                    formData.append(key, value as string);
                }
            });

            const response = await couponService.updateCoupon(coupon.id, formData);
            if (!response.error) {
                showToast(`Coupon status changed to ${newStatus}`, "success");
                refetchData();
            } else {
                showToast(response.error.message || "Failed to update status", "error");
            }
        } catch (error) {
            showToast("An unexpected error occurred", "error");
        } finally {
            setStatusLoadingId(null);
        }
    };

    const handleDelete = async (coupon: Coupon) => {
        if (isStaff) return;

        const confirmed = await showConfirm({
            title: "Delete Coupon",
            message: `Are you sure you want to delete "${coupon.name}"? This action cannot be undone.`,
            confirmLabel: "Delete",
            variant: "danger"
        });

        if (confirmed) {
            try {
                const response = await couponService.deleteCoupon(coupon.id);
                if (!response.error) {
                    showToast("Coupon deleted successfully!", "success");
                    refetchData();
                } else {
                    showToast(response.error.message || "Failed to delete coupon", "error");
                }
            } catch (error) {
                showToast("An unexpected error occurred", "error");
            }
        }
    };

    return (
        <div className="min-h-screen sm:p-4 py-4 md:p-8">
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <AddCoupon
                        onClose={() => setIsAddModalOpen(false)}
                        onSuccess={() => {
                            refetchData();
                            setIsAddModalOpen(false);
                        }}
                    />
                </div>
            )}

            {isEditModalOpen && editingCoupon && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <EditCoupons
                        coupon={editingCoupon}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setEditingCoupon(null);
                        }}
                        onSuccess={() => {
                            refetchData();
                            setIsEditModalOpen(false);
                            setEditingCoupon(null);
                        }}
                    />
                </div>
            )}

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 custom-main-color-card rounded-full flex items-center justify-center custom-main-color-icon shrink-0">
                            <BadgePercent size={24} className="custom-main-color-icon" />
                        </div>
                        <div>
                            <h1 className="text-[24px] sm:text-[30px] font-bold text-[var(--header-text)]">Coupons Management</h1>
                            <p className="text-gray-500 text-[12px] md:text-sm mt-1">Easily create, track, and manage discount coupons.</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full xl:w-auto">
                    <button
                        onClick={handleAddCouponClick}
                        className={`flex items-center gap-2 px-4 py-2.5 custom-main-color-button custom-main-color-button-hover text-white rounded-full sm:text-[14px] text-[12px] font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap ${
                            isStaff ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <Plus size={16} strokeWidth={3} /> Add Coupon
                    </button>
                </div>
            </div>

            <div
                className="mb-6 card-theme rounded-[24px] p-3 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                    <input
                        type="text"
                        placeholder="Search coupons by name or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 input-theme border border-gray-100 rounded-[20px] focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-base shadow-sm"
                    />
                </div>
                <div className="relative group w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full appearance-none pl-11 pr-10 py-3 card-theme rounded-[20px] text-base font-bold text-slate-500 outline-none cursor-pointer shadow-sm"
                    >
                        <option value="All Status">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                    <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                </div>
            </div>

            <div className="card-theme rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                {loading && coupons.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin custom-main-color-icon" size={32}/>
                    </div>
                ) : (
                    <>
                        <table className="w-full text-left border-collapse table-auto">
                            <thead className="hidden md:table-header-group bg-gray-50/50 text-[14px]">
                            <tr className="border-b border-gray-50/50">
                                <th className="px-6 py-4">Icon</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Discount</th>
                                <th className="px-6 py-4">Validity</th>
                                <th className="px-6 py-4">Min Order</th>
                                <th className="px-6 py-4">Max Discount</th>
                                <th className="px-6 py-4">Usage</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="block md:table-row-group">
                            {paginatedCoupons.length > 0 ? (
                                paginatedCoupons.map((coupon) => (
                                    <tr key={coupon.id}
                                        className="block md:table-row group hover:bg-gray-50/30 transition-all cursor-default border-b md:border-b-0 border-gray-100 last:border-b-0 p-4 md:p-0">
                                        <td className="hidden md:table-cell px-6 py-4">
                                            <div className="p-2 bg-emerald-50 rounded-full text-emerald-600 inline-block">
                                                <BadgePercent size={16}/>
                                            </div>
                                        </td>
                                        <td className="flex justify-between items-center md:table-cell px-6 py-2 md:py-4">
                                            <span className="md:hidden font-bold text-gray-400 text-xs">Name</span>
                                            <p className="font-bold text-[var(--header-text)] text-sm">{coupon.name}</p>
                                        </td>
                                        <td className="flex justify-between items-center md:table-cell px-6 py-2 md:py-4">
                                            <span className="md:hidden font-bold text-gray-400 text-xs">Code</span>
                                            <p className="inline-block font-bold px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-[20px] text-[10px] truncate max-w-[150px]">
                                                {coupon.code}
                                            </p>
                                        </td>
                                        <td className="flex justify-between items-center md:table-cell px-6 py-2 md:py-4 font-semibold text-[var(--header-text)] text-sm">
                                            <span className="md:hidden font-bold text-gray-400 text-xs">Discount</span>
                                            {coupon.type === 'percent' ? `${coupon.value}%` : `$${coupon.value}`}
                                        </td>
                                        <td className="flex justify-between items-center md:table-cell px-6 py-2 md:py-4 text-[var(--header-text)] text-xs">
                                            <span className="md:hidden font-bold text-gray-400 text-xs">Validity</span>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} className="text-gray-400 shrink-0"/>
                                                <span className="truncate">{coupon.start_date ? coupon.start_date.split(" ")[0] : "N/A"}</span>
                                                <p className="mx-1 text-[var(--header-text)]">-</p>
                                                <span className="truncate">{coupon.end_date ? coupon.end_date.split(" ")[0] : "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="flex justify-between items-center md:table-cell px-6 py-2 md:py-4 text-gray-400 text-sm">
                                            <span className="md:hidden font-bold text-gray-400 text-xs">Min Order</span>
                                            ${coupon.min_amount}
                                        </td>
                                        <td className="flex justify-between items-center md:table-cell px-6 py-2 md:py-4 text-gray-400 text-sm">
                                            <span className="md:hidden font-bold text-gray-400 text-xs">Max Discount</span>
                                            ${coupon.max_discount}
                                        </td>
                                        <td className="flex justify-between items-center md:table-cell px-6 py-2 md:py-4 text-gray-400 text-sm">
                                            <span className="md:hidden font-bold text-gray-400 text-xs">Usage</span>
                                            {coupon.used}/{coupon.usage_limit}
                                        </td>
                                        <td className="flex justify-between items-center md:table-cell px-6 py-2 md:py-4">
                                            <span className="md:hidden font-bold text-gray-400 text-xs">Status</span>
                                            <span
                                                className={`px-3 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${coupon.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {coupon.status}
                                            </span>
                                        </td>
                                        <td className="flex justify-center md:table-cell px-6 py-4 mt-2 md:mt-0 border-t md:border-t-0 border-gray-100 pt-3 md:pt-4">
                                            <div className="flex items-center justify-center gap-3 text-gray-400">
                                                <button
                                                    onClick={() => router.push(`/admin/coupons/${coupon.id}`)}
                                                    className="p-2 custom-main-color-bg-hover custom-main-color-text-hover rounded-full cursor-pointer"
                                                >
                                                    <Eye size={16}/>
                                                </button>
                                                <button
                                                    disabled={isStaff}
                                                    onClick={() => {
                                                        setEditingCoupon(coupon);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className={`p-2 transition-colors ${
                                                        isStaff ? 'opacity-25 cursor-not-allowed text-gray-400' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full cursor-pointer'
                                                    }`}
                                                >
                                                    <Edit2 size={16}/>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(coupon)}
                                                    disabled={isStaff || statusLoadingId === coupon.id}
                                                    className={`p-2 rounded-full transition-colors ${
                                                        isStaff ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer ' + (
                                                            coupon.status === 'active'
                                                                ? 'text-orange-400 hover:text-orange-600 hover:bg-orange-50'
                                                                : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        )
                                                    }`}
                                                >
                                                    {statusLoadingId === coupon.id ? (
                                                        <Loader2 size={16} className="animate-spin"/>
                                                    ) : coupon.status === 'active' ? (
                                                        <ShieldCheck size={16}/>
                                                    ) : (
                                                        <ShieldAlert size={16}/>
                                                    )}
                                                </button>
                                                <button
                                                    disabled={isStaff}
                                                    onClick={() => handleDelete(coupon)}
                                                    className={`p-2 transition-colors ${
                                                        isStaff ? 'opacity-25 cursor-not-allowed text-gray-400' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full cursor-pointer'
                                                    }`}
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10}>
                                        <div className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                                            <BadgePercent className="w-12 h-12 text-gray-300"/>
                                            <span> No coupons found.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>

                        {/* BOTTOM PACK (Total Items & Pagination) */}
                        {filteredCoupons.length > 0 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 gap-4 border-t border-gray-50/50">
                                <div className="text-sm text-gray-500 font-medium">
                                    Total items: <span className="font-bold text-emerald-500">{filteredCoupons.length}</span>
                                    <span className="px-1">Coupons</span>
                                </div>
                                {/* Only render Pagination if total items exceed ITEMS_PER_PAGE */}
                                {filteredCoupons.length > ITEMS_PER_PAGE && (
                                    <Pagination
                                        currentPage={safePage}
                                        totalPages={Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE)}
                                        onPageChange={setCurrentPage}
                                    />
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Coupons;