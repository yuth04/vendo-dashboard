'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Edit3, Layers, AlertCircle, ShoppingBag, Hash, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { useApiData } from "@/src/app/components/services/utils/customHook";
import { useRouter } from 'next/navigation';
import { categoriesClient } from "@/src/app/components/modules/settings/categories/core/api/categoriesClient";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { CategoryService } from "../core/services/categoriesService"; // FIXED: Changed wildcard import to explicit object import


interface CategoryDetailPageProps {
    categoryId: number;
    onBack: () => void;
    onEdit: (category: any) => void;
    onDelete: (id: number, name: string) => Promise<void>;
}

const CategoryDetails = ({ categoryId, onBack, onEdit, onDelete }: CategoryDetailPageProps) => {
    const router = useRouter();
    const { showToast, showConfirm } = useAlert();
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCategory = useCallback(
        async (signal?: AbortSignal) => {
            if (!categoryId) throw new Error("No Category ID provided");
            return await categoriesClient.fetchCategoryById(categoryId, signal);
        },
        [categoryId]
    );

    const { data, loading, error, refetchData: refresh } = useApiData(fetchCategory, null, true);

    useEffect(() => {
        const handleUpdate = () => refresh();
        window.addEventListener('categoryUpdated', handleUpdate);
        return () => window.removeEventListener('categoryUpdated', handleUpdate);
    }, [refresh]);

    const category = data?.data || data?.category || data?.result || data;

    const handleDelete = async () => {
        if (!category) return;

        const confirmed = await showConfirm({
            title: "Delete Category",
            message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
            confirmLabel: "Delete",
            variant: "danger"
        });

        if (confirmed) {
            setIsDeleting(true);
            try {
                const res = await CategoryService.deleteCategoryLogic(Number(category.id));
                if (res && !res.error) {
                    showToast("Category deleted successfully", "success");
                    onBack();
                } else {
                    showToast(res?.error?.message || "Failed to delete category", "error");
                }
            } catch (err) {
                showToast("A server error occurred", "error");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    if (loading && !category) {
        return (
            <div className="min-h-screen p-4 sm:p-8 animate-pulse">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-10 w-10 bg-gray-100 rounded-xl" />
                    <div className="flex-1 space-y-2"><div className="h-8 w-48 bg-gray-100 rounded-lg" /></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
                    <div className="h-[500px] bg-gray-50 rounded-[32px]" />
                    <div className="space-y-6">
                        <div className="h-32 bg-gray-50 rounded-2xl" />
                        <div className="h-32 bg-gray-50 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (error && !category) {
        return (
            <div className="min-h-screen p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-red-50 p-8 rounded-[32px] border border-red-100 max-w-md">
                    <AlertCircle className="text-red-400 mb-4 mx-auto" size={48} />
                    <h3 className="text-red-800 font-black text-lg uppercase tracking-tight">Load Failed</h3>
                    <p className="text-sm text-red-500/70 mt-2 mb-6">We couldn't retrieve the data for Category #{categoryId}.</p>
                    <button onClick={onBack} className="w-full py-3 bg-white border-2 border-red-100 text-red-500 rounded-2xl text-xs font-black hover:bg-red-100 transition-all cursor-pointer shadow-sm">
                        RETURN TO CATEGORIES
                    </button>
                </div>
            </div>
        );
    }

    const isActive = category?.is_active === true || category?.is_active === 1;
    const totalProducts = category?.products_count ?? category?.total_products ?? (Array.isArray(category?.products) ? category.products.length : 0);

    return (
        <div className="min-h-screen py-2 px-4 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <nav className="flex items-center gap-1.5 text-[12px] text-gray-400 font-medium mb-6 overflow-x-auto no-scrollbar">
                <span
                    className="custom-main-color-text-hover cursor-pointer whitespace-nowrap"
                    onClick={() => router.push('/admin/dashboard')}
                >
                    Dashboard
                </span>
                <ChevronRight size={12} strokeWidth={3} className="shrink-0"/>
                <span
                    className="custom-main-color-text-hover cursor-pointer whitespace-nowrap"
                    onClick={() => router.push('/admin/settings/categories')}
                >
                    Categories
                </span>
                <ChevronRight size={12} strokeWidth={3} className="shrink-0"/>
                <span className="text-[var(--header-text)] whitespace-nowrap">
                Category Details
                </span>
            </nav>

            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
                <div className="flex items-start gap-4 w-full">
                    <button
                        onClick={onBack}
                        className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border card-theme text-gray-400 bg-white transition-all shadow-sm cursor-pointer hover:bg-gray-50 active:scale-90"
                    >
                        <ArrowLeft size={16}/>
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <h1 className="text-2xl sm:text-4xl font-black text-[var(--header-text)] truncate tracking-tight">
                                {category?.name || "Category Detail"}
                            </h1>
                            <span
                                className={`w-fit inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 ${isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                {isActive ? '● Active' : '○ Inactive'}
                            </span>
                        </div>
                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Category Insight &
                            Management</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-red-50 border-2 border-red-100 px-6 py-3.5 text-sm font-black text-red-500 hover:bg-red-100 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                        {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18}/>}
                        <span>Delete</span>
                    </button>
                    <button
                        onClick={() => onEdit(category)}
                        className="flex items-center justify-center gap-2 rounded-2xl custom-main-color-button w-full lg:px-8 px-6 py-3.5 text-sm font-black text-white shadow-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                        <Edit3 size={18}/>
                        <span>Edit Category</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
                <div
                    className="rounded-[30px] sm:rounded-[40px] card-theme bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div
                        className="aspect-video bg-gray-50 flex items-center justify-center border-b border-gray-100 relative overflow-hidden">
                        {category?.image ? (
                            <img src={category.image} alt={category.name} className="w-full h-full object-cover"/>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <Layers size={100} strokeWidth={0.5} className="text-gray-200"/>
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">No Media Found</span>
                            </div>
                        )}
                    </div>
                    <div className="p-6 sm:p-10">
                        <div className="max-w-2xl">
                            <label
                                className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] block mb-3">Display
                                Name</label>
                            <h2 className="text-2xl sm:text-5xl font-black text-[var(--header-text)] leading-tight mb-6 sm:mb-8">{category?.name}</h2>
                            <div className="flex flex-wrap gap-4">
                                <div className="bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
                                    <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">URL
                                        Slug</label>
                                    <span
                                        className="text-sm font-mono font-bold text-indigo-600">/{category?.slug || "no-slug"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div
                        className="rounded-[32px] card-theme bg-white p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><ShoppingBag size={80}/></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Inventory
                            Overview</p>
                        <div className="flex items-end gap-3">
                            <span
                                className="text-4xl sm:text-5xl font-black text-[var(--header-text)]">{totalProducts}</span>
                            <span className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Total Products</span>
                        </div>
                    </div>

                    <div className="rounded-[32px] card-theme bg-white p-8 border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">System
                            Details</p>
                        <div className="space-y-5">
                            <div className="flex justify-between items-center group">
                                <div className="flex items-center gap-2">
                                    <Hash size={14} className="text-gray-300"/>
                                    <span className="text-[10px] font-black uppercase text-gray-400">ID</span>
                                </div>
                                <span
                                    className="text-xs font-mono font-black text-cyan-600 bg-cyan-50 px-3 py-1 rounded-lg">#{category?.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-gray-400">Structure</span>
                                <span
                                    className="text-xs font-bold text-gray-600">{category?.parent_category_id ? 'Sub-Category' : 'Root Category'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-gray-400">Parent Ref</span>
                                <span
                                    className="text-xs font-bold text-gray-400">#{category?.parent_category_id || "None"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryDetails;