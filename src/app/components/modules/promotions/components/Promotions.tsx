"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search, ChevronDown, ChevronRight, Loader2,
    Filter, Calendar, Tag, Edit2, Plus, Trash2, Eye
} from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import AddPromotion from "./AddPromotion";
import EditPromotion from "./EditPromotion";
import AddDiscount from "./AddProducts";
import { Discount, PromotionResponse } from "@/src/app/components/modules/promotions/core/models/promotionModel";
import { promotionService } from "@/src/app/components/modules/promotions/core/services/promotionService";
import { usePromotionData } from "@/src/app/components/modules/promotions/core/hook/usePromotionData";
import {productClient} from "@/src/app/components/modules/products/core/api/productClient";
import Pagination from "@/src/app/components/modules/promotions/components/Pagination";


const ITEMS_PER_PAGE = 8;

const Promotions = () => {
    const router = useRouter();
    const { showConfirm, showToast } = useAlert();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const [isDeleting, setIsDeleting] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState<any>(null);


    const [currentPage, setCurrentPage] = useState(1);

    const { data, loading, refetchData } = usePromotionData<PromotionResponse>(
        promotionService.fetchPromotions,
        { message: "", discount: [] },
        true
    );

    const { data: productData } = usePromotionData<any>(
        productClient.fetchProducts,
        null,
        true
    );

    const discounts = data?.discount || [];
    const products = productData?.product || [];

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

    const toggleExpand = (id: number) => {
        setExpandedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const handleViewDetail = (id: number) => {
        router.push(`/admin/promotions/${id}`);
    };

    const handleOpenEditModal = (category: any) => {
        if (isStaff) return;
        setSelectedCategory(category);
        setIsEditModalOpen(true);
    };

    const handleAddPromotionClick = () => {
        if (isStaff) {
            showToast("Only super-admin and admin can add promotion.", "error");
            return;
        }
        setIsAddModalOpen(true);
    };

    const handleAddProductsClick = () => {
        if (isStaff) {
            showToast("Only super-admin and admin can add products.", "error");
            return;
        }
        setIsDiscountModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (isStaff) return;

        const confirmed = await showConfirm({
            title: "Delete Promotion?",
            message: "This will permanently remove this campaign. Are you sure?",
            variant: "danger",
            confirmLabel: "Delete Now"
        });

        if (confirmed) {
            setIsDeleting(true);
            try {
                const response = await promotionService.deleteDiscount(id);
                if (!response.error) {
                    showToast("Promotion removed successfully", "success");
                    refetchData();
                } else {
                    showToast(response.error.message || "Failed to delete", "error");
                }
            } catch (err) {
                showToast("An unexpected error occurred", "error");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleRemoveProductFromDiscount = async (productId: number) => {
        if (isStaff) return;

        const confirmed = await showConfirm({
            title: "Remove Product?",
            message: "Are you sure you want to remove this product from the discount campaign?",
            variant: "danger",
            confirmLabel: "Remove Product"
        });

        if (confirmed) {
            setIsDeleting(true);
            try {
                const response = await promotionService.removeProductFromDiscount(productId);
                if (!response.error) {
                    showToast("Product removed successfully", "success");
                    refetchData();
                } else {
                    showToast(response.error.message || "Failed to remove product", "error");
                }
            } catch (err) {
                showToast("An unexpected error occurred", "error");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const filteredData = discounts.filter(disc => {
        const matchesSearch = (disc.name || "").toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === "Active") {
            matchesStatus = !!disc.is_active;
        } else if (statusFilter === "Inactive") {
            matchesStatus = !disc.is_active;
        }

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const safePage = Math.max(1, Math.min(currentPage, totalPages > 0 ? totalPages : 1));


    const indexOfLastItem = safePage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="min-h-screen sm:p-6 py-4 md:p-8 relative">

            {isDeleting && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/20 backdrop-blur-[2px] animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3 border border-gray-50">
                        <Loader2 className="animate-spin text-red-500" size={32} />
                        <span className="text-[12px] font-black uppercase tracking-widest text-slate-600">Removing Record</span>
                    </div>
                </div>
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <AddPromotion onClose={() => setIsAddModalOpen(false)} onSuccess={() => refetchData()} />
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <EditPromotion
                        data={selectedCategory}
                        onClose={() => { setIsEditModalOpen(false); setSelectedCategory(null); }}
                        onSuccess={() => { refetchData(); }}
                    />
                </div>
            )}

            {isDiscountModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <AddDiscount
                        onClose={() => setIsDiscountModalOpen(false)}
                        onSuccess={() => refetchData()}
                        allDiscounts={discounts}
                        allProducts={products}
                    />
                </div>
            )}

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 custom-main-color-card rounded-full flex items-center justify-center custom-main-color-icon shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round" className="lucide lucide-megaphone">
                                <path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>
                                <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/>
                                <path d="M8 6v8"/>
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-[24px] md:text-[30px] font-bold text-[var(--header-text)]">Promotions & Discounts</h1>
                            <p className="text-gray-500 text-[12px] md:text-sm mt-1">Monitor and update your seasonal discount campaigns.</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 no-scrollbar">
                    <button onClick={handleAddPromotionClick}
                            className={`flex items-center gap-2 px-5 py-2.5 custom-main-color-button custom-main-color-button-hover text-white rounded-[20px] sm:text-[14px] text-[12px] font-bold cursor-pointer whitespace-nowrap ${
                                isStaff ? 'opacity-50 cursor-not-allowed' : ''
                            }`}>
                        <Plus size={16}/> Add Promotion
                    </button>
                    <button onClick={handleAddProductsClick}
                            className={`flex items-center gap-2 px-5 py-2.5 custom-main-color-button custom-main-color-button-hover text-white rounded-full sm:text-[14px] text-[12px] font-bold cursor-pointer whitespace-nowrap ${
                                isStaff ? 'opacity-50 cursor-not-allowed' : ''
                            }`}>
                        <Plus size={16}/> Add Discounts
                    </button>
                </div>
            </div>

            <div className="mb-6 card-theme rounded-[20px] p-3 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                    <input
                        type="text"
                        placeholder="Search promotions by name..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-12 pr-4 py-3 input-theme rounded-[20px] focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-base shadow-sm"
                    />
                </div>
                <div className="relative group w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full appearance-none pl-11 pr-10 py-3 card-theme rounded-[20px] text-base font-bold text-slate-500 outline-none cursor-pointer shadow-sm"
                    >
                        <option value="All Status">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                    <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <div className="rounded-[24px] overflow-hidden shadow-sm relative mb-6 card-theme border border-gray-100">
                {loading && (
                    <div className="absolute inset-0 card-theme z-[25] flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="p-5 flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin custom-main-color-icon" size={32} />
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm min-w-[900px]">
                        <thead className="bg-gray-50/50">
                        <tr className="border-b border-gray-50/50">
                            <th className="pl-8 pr-6 py-5 text-[14px] font-bold text-[var(--header-text)]">Banner</th>
                            <th className="pl-8 pr-6 py-5 text-[14px] font-bold text-[var(--header-text)]">Promotions Name</th>
                            <th className="px-6 py-5 text-[14px] font-bold text-[var(--header-text)]">Discounts</th>
                            <th className="px-6 py-5 text-[14px] font-bold text-[var(--header-text)]">Type</th>
                            <th className="px-6 py-5 text-[14px] font-bold text-[var(--header-text)]">Slug</th>
                            <th className="px-6 py-5 text-[14px] font-bold text-[var(--header-text)]">Status</th>
                            <th className="px-6 py-5 text-[14px] font-bold text-[var(--header-text)] text-right pr-8">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                        {paginatedData.map((discount: Discount) => {
                            const isExpanded = expandedRows.includes(discount.id);
                            return (
                                <React.Fragment key={discount.id}>
                                    <tr className="hover:bg-gray-50/30 transition-all group">
                                        <td className="pl-4 pr-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => toggleExpand(discount.id)}
                                                        className={`p-1.5 card-theme rounded-full text-gray-400 custom-main-color-text-hover transition-all cursor-pointer ${isExpanded ? 'rotate-90 bg-emerald-50' : ''}`}>
                                                    <ChevronRight size={14}/>
                                                </button>
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                                    <img src={discount.banner_image || '/placeholder.png'} alt=""
                                                         className="w-full h-full object-cover rounded-lg"/>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="pl-4 pr-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-gray-400">{discount.name}</span>
                                                    <span className="text-[11px] text-gray-400 truncate max-w-[200px] font-medium">{discount.description}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 sm:px-3 sm:py-1.5 border rounded-[20px] bg-blue-50 text-blue-500 border-blue-100 sm:text-[10px] text-[8px] font-black uppercase">
                                                {discount.amount}{discount.type === 'percent' ? '%' : '$'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded-lg">
                                                {discount.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-tight">{discount.slug || "N/A"}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-[20px] text-[9px] font-black border uppercase tracking-wider ${discount.is_active ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                {discount.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right pr-8">
                                            <div className="flex items-center justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleViewDetail(discount.id)}
                                                        className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer">
                                                    <Eye size={15}/>
                                                </button>
                                                <button
                                                    disabled={isStaff}
                                                    onClick={() => handleOpenEditModal(discount)}
                                                    className={`p-2 transition-colors ${
                                                        isStaff ? 'opacity-25 cursor-not-allowed text-gray-400' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full cursor-pointer'
                                                    }`}
                                                >
                                                    <Edit2 size={15}/>
                                                </button>
                                                <button
                                                    disabled={isStaff}
                                                    onClick={() => handleDelete(discount.id)}
                                                    className={`p-2 transition-colors ${
                                                        isStaff ? 'opacity-25 cursor-not-allowed text-gray-400' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full cursor-pointer'
                                                    }`}
                                                >
                                                    <Trash2 size={15}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {isExpanded && (
                                        <React.Fragment>
                                            <tr className="bg-gray-50/20 group">
                                                <td colSpan={7} className="pl-20 py-3">
                                                    <div className="flex items-center justify-between pr-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-white px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-2">
                                                                <Tag size={12} className="text-emerald-500"/>
                                                                <span className="text-xs font-bold text-emerald-600">Timeline & Conditions</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold uppercase tracking-tight">
                                                                <Calendar size={12}/>
                                                                <span>{discount.start_date || 'No Start'} — {discount.end_date || 'No End'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            {discount.products?.map((product: any) => (
                                                <tr key={product.id} className="border-l-4 border-emerald-500/20 hover:bg-gray-50 transition-colors group/item">
                                                    <td className="pl-28 pr-6 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 p-1 shrink-0 overflow-hidden shadow-sm">
                                                                <img src={product.image} className="w-full h-full object-contain" alt=""/>
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-600 truncate">{product.productName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-emerald-600">${product.discount_price}</span>
                                                            <span className="text-[10px] text-gray-400 line-through font-bold">${product.price}</span>
                                                        </div>
                                                    </td>
                                                    <td colSpan={4} className="px-6 py-3 text-[10px] font-bold text-gray-300 uppercase tracking-widest">ID: {product.id}</td>
                                                    <td className="px-6 py-3 text-right pr-8">
                                                        <div className="flex items-center justify-end gap-1 md:opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                            <button
                                                                disabled={isStaff}
                                                                onClick={() => handleRemoveProductFromDiscount(product.id)}
                                                                className={`p-2 transition-colors ${
                                                                    isStaff ? 'opacity-25 cursor-not-allowed text-gray-400' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full cursor-pointer'
                                                                }`}
                                                            >
                                                                <Trash2 size={14}/>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    )}
                                </React.Fragment>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {/* BOTTOM PACK (Total Items & Pagination) */}
                {filteredData.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 gap-4 border-t border-gray-50/50">
                        <div className="text-sm text-gray-500 font-medium">
                            Total items: <span className="font-bold text-emerald-500">{filteredData.length}</span>
                            <span className="px-1">Promotions</span>
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

                {!loading && filteredData.length === 0 && (
                    <div className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                             strokeLinejoin="round" className="w-12 h-12 text-gray-300">
                            <path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>
                            <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/>
                            <path d="M8 6v8"/>
                        </svg>
                        <span>No promotions found.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Promotions;