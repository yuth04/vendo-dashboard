"use client";

import React, { useState, useMemo } from 'react';
import {
    Search,
    ChevronRight,
    Loader2,
    Edit2,
    Filter,
    Boxes,
    Download,
    Trash2,
    ImageOff
} from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import EditStock from "./EditStock";
import Pagination from "./Pagination";
import {
    INITIAL_CATEGORY_DATA,
    INITIAL_VARIANT_DATA,
    ProductVariant,
    VariantListResponse
} from "@/src/app/components/modules/stock/core/models/stockModel";
import { useStockData } from "@/src/app/components/modules/stock/core/hook/useStockData";
import { stockClient } from "@/src/app/components/modules/stock/core/api/stockClient";
import {stockService, StockStatus} from "@/src/app/components/modules/stock/core/services/stockService";
import StockMobileCard from "@/src/app/components/modules/stock/components/StockMobileCard";


const Stock = () => {
    const { showToast, showConfirm } = useAlert();
    const [expandedProducts, setExpandedProducts] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
    const [selectedStockStatus, setSelectedStockStatus] = useState<StockStatus>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const { data, loading, refetchData } = useStockData<VariantListResponse>(
        stockClient.fetchVariants,
        INITIAL_VARIANT_DATA,
        true
    );

    const { data: catData } = useStockData<any>(
        stockClient.fetchCategories,
        INITIAL_CATEGORY_DATA,
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

    const categoryOptions = useMemo(() => {
        if (!catData) return [];
        return catData.category || [];
    }, [catData]);

    const categoryMap = useMemo(
        () => stockService.buildCategoryMap(categoryOptions),
        [categoryOptions]
    );


    const allGroupedProducts = useMemo(
        () => stockService.groupAndFilterVariants(data || null, searchQuery, selectedCategoryId, selectedStockStatus),
        [data, searchQuery, selectedCategoryId, selectedStockStatus]
    );

    const totalPages = stockService.getTotalPages(allGroupedProducts.length, itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = stockService.paginate(allGroupedProducts, currentPage, itemsPerPage);

    const toggleExpand = (productId: number) => {
        setExpandedProducts(prev =>
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    };

    const handleOpenEdit = (variant: ProductVariant) => {
        if (isStaff) {
            showToast("Only super-admin and admin can edit product variants.", "error");
            return;
        }
        setSelectedVariant(variant);
        setIsEditOpen(true);
    };

    const handleSaveStock = async (variantId: number, newStock: number) => {
        if (isStaff) return;
        await stockService.saveStock({
            variantId,
            newStock,
            setIsUpdating,
            onSuccess: (msg) => showToast(msg, "success"),
            onError: (msg) => showToast(msg, "error"),
            onClose: () => setIsEditOpen(false),
            refetchData,
        });
    };

    const handleDeleteVariant = async (variantId: number) => {
        if (isStaff) {
            showToast("Only super-admin and admin can delete product variants.", "error");
            return;
        }

        const confirmed = await showConfirm({
            title: "Delete Variant",
            message: "Are you sure you want to delete this variant? This action cannot be undone.",
            confirmLabel: "Delete",
            cancelLabel: "Cancel",
            variant: "danger"
        });

        if (!confirmed) return;

        await stockService.deleteVariant({
            variantId,
            onSuccess: (msg) => { showToast(msg, "success"); refetchData(); },
            onError: (msg) => showToast(msg, "error"),
        });
    };

    const handleExport = async (type: 'excel' | 'pdf') => {
        await stockService.exportStock({
            type,
            onSuccess: (msg) => showToast(msg, "success"),
            onError: (msg) => showToast(msg, "error"),
        });
    };

    return (
        <div className="min-h-screen sm:p-4 py-4 md:p-8">
            <EditStock
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                variant={selectedVariant}
                onSave={handleSaveStock}
                isUpdating={isUpdating}
            />

            {/* --- HEADER --- */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 sm:w-12 sm:h-12 custom-main-color-card rounded-full flex items-center justify-center custom-main-color-icon shrink-0">
                        <Boxes size={24} className="custom-main-color-icon"/>
                    </div>
                    <div>
                        <h1 className="text-[24px] md:text-[30px] font-bold text-[var(--header-text)]">Stocks Management</h1>
                        <p className="text-gray-500 text-[12px] md:text-sm mt-1">Monitor and update your inventory levels.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleExport('excel')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full sm:text-[14px] text-[12px] font-bold transition-all shadow-sm whitespace-nowrap cursor-pointer"
                    >
                        <Download size={16}/>
                        Export Excel
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        className="flex items-center gap-2 px-4 py-2.5 card-theme text-gray-500 rounded-full sm:text-[14px] text-[12px] font-bold shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
                    >
                        <Download size={16}/>
                        Export PDF
                    </button>
                </div>
            </div>

            {/* --- SEARCH & FILTERS --- */}
            <div
                className="mb-6 card-theme rounded-[20px] p-3 shadow-sm flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input
                        type="text"
                        placeholder="Search by product name..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-12 pr-4 py-3 input-theme rounded-[20px] outline-none focus:ring-1 focus:ring-emerald-500 text-base shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-2 md:flex gap-3">
                    <div className="relative min-w-[160px]">
                        <select
                            value={selectedCategoryId}
                            onChange={(e) => {
                                setSelectedCategoryId(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full appearance-none pl-11 pr-10 py-3 card-theme rounded-[20px] text-base font-bold text-slate-500 outline-none cursor-pointer shadow-sm"
                        >
                            <option value="all">All Categories</option>
                            {categoryOptions?.map((cat: any) => (
                                <option key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" />
                    </div>

                    <div className="relative min-w-[160px]">
                        <select
                            value={selectedStockStatus}
                            onChange={(e) => {
                                setSelectedStockStatus(e.target.value as StockStatus);
                                setCurrentPage(1);
                            }}
                            className="w-full appearance-none pl-11 pr-10 py-3 card-theme rounded-[20px] text-[12px] sm:text-[14px] font-bold text-slate-500 outline-none cursor-pointer shadow-sm"
                        >
                            <option value="all">All Stock Status</option>
                            <option value="low">Low Stock</option>
                            <option value="out">Out of Stock</option>
                        </select>
                        <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" />
                    </div>
                </div>
            </div>

            {/* --- TABLE & MOBILE VIEW --- */}
            <div className="card-theme border border-gray-100 rounded-2xl overflow-hidden shadow-sm relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 z-[20] flex items-center justify-center">
                        <Loader2 className="animate-spin custom-main-color-icon" size={32}/>
                    </div>
                )}

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto w-full">
                    <table className="w-full text-left border-separate border-spacing-0 min-w-[800px]">
                        <thead className="bg-gray-50/30">
                        <tr className="text-[14px] font-bold text-[var(--header-text)] border-b bg-gray-50/50">
                            <th className="px-6 py-5 ">Product</th>
                            <th className="px-6 py-5 ">ID</th>
                            <th className="px-6 py-5 ">Category</th>
                            <th className="px-6 py-5 ">Current Stock</th>
                            <th className="px-6 py-5 ">Status</th>
                            <th className="px-6 py-5 text-right pr-8">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {paginatedProducts.length > 0 ? (
                            paginatedProducts.map((group) => {
                                const isExpanded = expandedProducts.includes(group.product.id);
                                const catId = (group.product.category_id || group.product.category?.id)?.toString();
                                return (
                                    <React.Fragment key={group.product.id}>
                                        <tr className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="pl-4 pr-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpand(group.product.id)}
                                                        className={`p-1.5 card-theme rounded-full text-gray-400 hover:bg-gray-100 transition-transform cursor-pointer ${isExpanded ? 'rotate-90' : ''}`}
                                                    >
                                                        <ChevronRight size={14}/>
                                                    </button>
                                                    <div
                                                        className="sm:w-12 sm:h-12 w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center overflow-hidden shrink-0">
                                                        <img src={group.product.image || '/placeholder.png'} alt=""
                                                             className="max-w-full max-h-full object-contain mix-blend-multiply"/>
                                                    </div>
                                                    <span
                                                        className="text-sm font-bold text-[var(--header-text)] truncate">{group.product.productName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                    <span
                                                        className="text-[10px] font-bold border bg-blue-50 text-blue-600 border-blue-100 px-2 py-1.5 rounded-[20px] tracking-tight">Product ID {group.product.id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                    <span
                                                        className="text-sm text-[var(--header-text)] font-medium whitespace-nowrap">
                                                        {catId ? (categoryMap[catId] || 'General') : 'General'}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                    <span
                                                        className="text-lg font-black text-[var(--header-text)]">{group.totalStock}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                    <span
                                                        className={`px-3 py-1.5 rounded-[20px] text-[10px] font-black border uppercase tracking-wider whitespace-nowrap ${
                                                            group.totalStock <= 0 ? 'bg-red-50 text-red-500 border-red-100' :
                                                                group.totalStock <= 5 ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                                                        }`}>
                                                        {stockService.getStockStatusLabel(group.totalStock)}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 text-right pr-8"></td>
                                        </tr>

                                        {isExpanded && group.variants.map((variant) => {
                                            const variantImg = variant.images?.find(img => img.is_primary)?.image || null;
                                            return (
                                                <tr key={variant.id}
                                                    className="card-theme border-l-2 border-emerald-500/20">
                                                    <td className="pl-20 pr-6 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {/* Changed the fallback from a placeholder image to the text/icon combo */}
                                                            {variantImg ? (
                                                                <div className="w-8 h-8 rounded-lg card-theme p-1 overflow-hidden flex items-center justify-center shrink-0">
                                                                    <img src={variantImg} alt="" className="max-w-full max-h-full object-contain"/>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 text-gray-400 shrink-0 px-1">
                                                                    <ImageOff size={16} />
                                                                    <span className="text-[12px] font-medium whitespace-nowrap">No image</span>
                                                                </div>
                                                            )}

                                                            <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                                                                Color: <span className="font-semibold text-blue-500">{variant.color}</span>,
                                                                Size: <span className="font-semibold text-blue-500">{variant.size}</span>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                            <span
                                                                className="text-[10px] font-medium bg-orange-50 border text-orange-500 border-orange-100 px-2 py-1 rounded-[20px]">variant ID {variant.id}</span>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <span className="text-xs text-gray-300 font-medium">---</span>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                            <span
                                                                className="text-sm font-bold text-[var(--header-text)]">{variant.stock}</span>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                            <span
                                                                className={`px-2 py-1 rounded-[20px] text-[9px] font-bold border uppercase whitespace-nowrap ${
                                                                    variant.stock <= 0 ? 'bg-red-50 text-red-500 border-red-100' :
                                                                        variant.stock <= 5 ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                                                                }`}>
                                                                {stockService.getStockStatusLabel(variant.stock)}
                                                            </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-right pr-8 flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEdit(variant)}
                                                            className={`p-2 rounded-full transition-all ${
                                                                isStaff ? 'text-gray-200 cursor-not-allowed' : 'text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 cursor-pointer'
                                                            }`}
                                                        >
                                                            <Edit2 size={14}/>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteVariant(variant.id)}
                                                            className={`p-2 rounded-full transition-all ${
                                                                isStaff ? 'text-gray-200 cursor-not-allowed' : 'text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer'
                                                            }`}
                                                        >
                                                            <Trash2 size={14}/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })
                        ) : !loading && (
                            <tr>
                                <td colSpan={6}>
                                    <div
                                        className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                                        <Boxes className="w-12 h-12 text-gray-300"/>
                                        <span> No stock found.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden space-y-4">
                    {paginatedProducts.length > 0 ? (
                        paginatedProducts.map((group) => (
                            <StockMobileCard
                                key={group.product.id}
                                group={group}
                                categoryMap={categoryMap}
                                isExpanded={expandedProducts.includes(group.product.id)}
                                onToggleExpand={toggleExpand}
                                onOpenEdit={handleOpenEdit}
                                onDeleteVariant={handleDeleteVariant}
                            />
                        ))
                    ) : !loading && (
                        <div className="card-theme rounded-2xl p-10 text-center text-gray-400 italic text-sm">
                            No products found.
                        </div>
                    )}
                </div>

                {/* --- PAGINATION --- */}
                <div className="flex flex-col sm:flex-row justify-between items-center py-8 px-6 gap-4 border-t border-gray-50/50">
                        <span className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-[var(--header-text)] font-bold">{Math.min(startIndex + itemsPerPage, allGroupedProducts.length)}</span> of <span className="text-[var(--header-text)] font-bold">{allGroupedProducts.length}</span>
                            <span className="ms-1">Products</span>
                        </span>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default Stock;