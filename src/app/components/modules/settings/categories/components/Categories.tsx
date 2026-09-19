'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Plus, Filter, Loader2, Eye, Edit3, MoreHorizontal, Trash2, ChevronDown, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import AddCategoryModal from "@/src/app/components/modules/settings/categories/components/AddCategoryModal";
import EditCategoryModal from "@/src/app/components/modules/settings/categories/components/EditCategoryModal";
import CategoryDetails from "./CategoryDetails";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { LuLayoutGrid } from "react-icons/lu";
import {
    Category,
    CategoryListResponse,
    INITIAL_CATEGORY_DATA
} from "@/src/app/components/modules/settings/categories/core/models/categoriesModel";
import { useCategoriesData } from "@/src/app/components/modules/settings/categories/core/hook/useCategoriesData";
import { categoriesClient } from "@/src/app/components/modules/settings/categories/core/api/categoriesClient";
import Pagination from "@/src/app/components/modules/settings/categories/components/Pagination";
import {CategoryService} from "@/src/app/components/modules/settings/categories/core/services/categoriesService";


const Categories = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { showToast, showConfirm } = useAlert();

    const viewingId = searchParams.get('view') ? Number(searchParams.get('view')) : null;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [openActionId, setOpenActionId] = useState<number | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // State to store dedicated Master Parent Categories identical to Edit Modal
    const [masterParentCategories, setMasterParentCategories] = useState<Category[]>([]);

    const { data, loading, error, refetchData: refresh } = useCategoriesData<CategoryListResponse>(
        categoriesClient.fetchCategories,
        INITIAL_CATEGORY_DATA,
        true
    );

    const categoriesList = data?.category || [];

    // Fetch master parent categories explicitly like your Edit Modal does
    useEffect(() => {
        const loadParents = async () => {
            try {
                const res: any = await categoriesClient.fetchParentCategories();
                const rawData = res.data?.data || res.data || [];
                if (!res.error && Array.isArray(rawData)) {
                    setMasterParentCategories(rawData);
                }
            } catch (err) {
                console.error("Failed to load master parent categories", err);
            }
        };
        loadParents();
    }, [data]);


    const parentCategoryLookupMap = useMemo(() => {
        const lookup = new Map<number, string>();
        masterParentCategories.forEach((cat) => {
            if (cat.id !== undefined && cat.id !== null) {
                lookup.set(Number(cat.id), cat.name);
            }
        });
        return lookup;
    }, [masterParentCategories]);

    const handleToggleStatus = async (cat: Category) => {
        const confirmed = await showConfirm({
            title: `${!cat.is_active ? 'Activate' : 'Deactivate'} Category`,
            message: `Are you sure you want to ${!cat.is_active ? 'activate' : 'deactivate'} "${cat.name}"?`,
            confirmLabel: !cat.is_active ? "Activate" : "Deactivate",
            variant: !cat.is_active ? "info" : "warning",
        });

        if (!confirmed) return;

        setStatusLoadingId(Number(cat.id));
        try {
            const { response, newStatus } = await CategoryService.toggleCategoryStatusLogic(cat);

            if (!response.error) {
                showToast(`Status updated to ${newStatus ? 'Active' : 'Inactive'}`, "success");
                refresh();
            } else {
                showToast(response.error.message || "Failed to update status", "error");
            }
        } catch (err) {
            showToast("An unexpected error occurred", "error");
        } finally {
            setStatusLoadingId(null);
        }
    };

    const filteredCategories = useMemo(() => {
        return CategoryService.filterCategoriesList(categoriesList, searchQuery, statusFilter);
    }, [categoriesList, searchQuery, statusFilter]);

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const safePage = Math.min(currentPage, totalPages || 1);

    const currentItems = useMemo(() => {
        return CategoryService.getPaginatedItems(filteredCategories, safePage, itemsPerPage);
    }, [filteredCategories, safePage]);

    const setViewingId = (id: number | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id) { params.set('view', id.toString()); } else { params.delete('view'); }
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleEditClick = (category: Category) => {
        setSelectedCategory(category);
        setIsEditModalOpen(true);
        setOpenActionId(null);
    };

    const handleDelete = async (id: number, name: string) => {
        const confirmed = await showConfirm({
            title: "Delete Category",
            message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            confirmLabel: "Delete",
            variant: "danger"
        });

        if (confirmed) {
            try {
                const response = await CategoryService.deleteCategoryLogic(id);
                if (!response.error) {
                    showToast("Category deleted successfully", "success");
                    if (viewingId === id) setViewingId(null);
                    refresh();
                } else {
                    showToast(response.error.message || "Failed to delete", "error");
                }
            } catch (err) {
                showToast("An error occurred during deletion", "error");
            }
        }
    };

    return (
        <>
            {viewingId ? (
                <CategoryDetails
                    categoryId={viewingId}
                    onBack={() => setViewingId(null)}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                />
            ) : (
                <div className="min-h-screen p-4 sm:p-8">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full custom-main-color-card custom-main-color-text">
                            <LuLayoutGrid className="w-5 h-5 sm:w-6 sm:h-6"/>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <h1 className="text-xl sm:text-2xl font-bold text-[var(--header-text)]">Categories</h1>
                            <p className="text-sm text-gray-500">Manage product categories and hierarchy.</p>
                        </div>
                        <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2">
                            <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full custom-main-color-button-hover custom-main-color-button px-6 py-2.5 text-sm font-bold text-white transition-all cursor-pointer">
                                <Plus size={18}/> Add Category
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col md:flex-row items-center gap-3 rounded-[20px] card-theme p-3 shadow-sm border border-gray-100">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search categories by name..."
                                className="w-full rounded-[20px] input-theme py-3 pl-11 pr-4 text-base outline-none shadow-sm"
                            />
                        </div>
                        <div className="relative group min-w-[180px] w-full md:w-auto">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none pl-11 pr-10 py-3 card-theme rounded-[20px] text-base font-bold text-slate-500 outline-none cursor-pointer shadow-sm"
                            >
                                <option value="All Statuses">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin custom-main-color-icon mb-2" size={32} />
                        </div>
                    )}

                    {!loading && filteredCategories.length === 0 && (
                        <div className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                            <LuLayoutGrid className="w-12 h-12 text-gray-300"/>
                            <span>No categories found.</span>
                        </div>
                    )}

                    {/* Table View (Desktop) */}
                    {!loading && !error && filteredCategories.length > 0 && (
                        <div className="mt-6 hidden md:block overflow-hidden rounded-xl border border-gray-100">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-[14px] font-semibold text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">Image</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Parent Category</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {currentItems.map((cat: Category) => (
                                    <tr key={cat.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4"><img src={cat.image || 'https://via.placeholder.com/40'} alt={cat.name} className="sm:w-12 sm:h-12 w-10 h-10 rounded-full object-cover border border-gray-100" /></td>
                                        <td className="px-6 py-4 font-bold text-[var(--header-text)]">{cat.name}</td>

                                        <td className="px-6 py-4 font-medium text-[var(--header-text)]">
                                            {cat.parent_category_id
                                                ? (parentCategoryLookupMap.get(Number(cat.parent_category_id)) || '-')
                                                : '-'
                                            }
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`rounded-[20px] px-2 py-1 text-[10px] font-bold ${cat.is_active ? "bg-emerald-50 border border-emerald-200 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                                                {cat.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setViewingId(Number(cat.id))} className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-all cursor-pointer"><Eye size={14}/></button>
                                                <button onClick={() => handleEditClick(cat)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-all cursor-pointer"><Edit3 size={14}/></button>

                                                <button onClick={() => handleToggleStatus(cat)} className={`p-1.5 rounded-md transition-all cursor-pointer ${cat.is_active ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50" : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"}`}>
                                                    {statusLoadingId === Number(cat.id) ? <Loader2 size={14} className="animate-spin" /> : (cat.is_active ? <ShieldAlert size={14}/> : <ShieldCheck size={14}/>)}
                                                </button>

                                                <button onClick={() => handleDelete(Number(cat.id), cat.name)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all cursor-pointer"><Trash2 size={14}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Card View (Mobile) */}
                    {!loading && !error && filteredCategories.length > 0 && (
                        <div className="md:hidden space-y-4 mt-6">
                            {currentItems.map((cat: Category) => (
                                <div key={cat.id} className="card-theme border border-gray-100 rounded-2xl p-4">
                                    <div className="flex items-center gap-4">
                                        <img src={cat.image || 'https://via.placeholder.com/40'} alt={cat.name} className="h-12 w-12 rounded-full object-cover border border-gray-100" />
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-400">{cat.name}</p>

                                            <p className="text-xs text-gray-400">
                                                Parent: {cat.parent_category_id
                                                ? (parentCategoryLookupMap.get(Number(cat.parent_category_id)) || '-')
                                                : '-'
                                            }
                                            </p>

                                            <div className="mt-1">
                                                <span className={`inline-block rounded-[20px] px-3 py-1 text-[9px] font-bold ${cat.is_active ? "bg-emerald-50 border border-emerald-200 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                                                    {cat.is_active ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <button onClick={() => setOpenActionId(openActionId === Number(cat.id) ? null : Number(cat.id))} className="p-2 text-gray-400 cursor-pointer">
                                                <MoreHorizontal size={20} />
                                            </button>
                                            {openActionId === Number(cat.id) && (
                                                <div className="absolute right-0 top-8 z-10 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[120px]">
                                                    <button onClick={() => { setViewingId(Number(cat.id)); setOpenActionId(null); }} className="flex items-center gap-2 w-full px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"><Eye size={14}/> View</button>
                                                    <button onClick={() => { handleEditClick(cat); setOpenActionId(null); }} className="flex items-center gap-2 w-full px-4 py-2 text-xs text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"><Edit3 size={14}/></button>
                                                    <button onClick={() => { handleToggleStatus(cat); setOpenActionId(null); }} className={`flex items-center gap-2 w-full px-4 py-2 text-xs transition-colors cursor-pointer ${cat.is_active ? "text-orange-500 hover:bg-orange-50" : "text-emerald-500 hover:bg-emerald-50"}`}>
                                                        {statusLoadingId === Number(cat.id) ? <Loader2 size={14} className="animate-spin" /> : (cat.is_active ? <ShieldAlert size={14}/> : <ShieldCheck size={14}/>)}
                                                        {cat.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button onClick={() => { handleDelete(Number(cat.id), cat.name); setOpenActionId(null); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={14}/></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* BOTTOM PACK (Total Items & Pagination) */}
                    {!loading && !error && filteredCategories.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-4 gap-4">
                            <div className="text-sm text-gray-500 font-medium">
                                Total items: <span
                                className="font-bold text-emerald-500">{filteredCategories.length}</span><span
                                className="px-1">Categories</span>
                            </div>
                            <Pagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            )}

            <AddCategoryModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onRefresh={refresh} />
            <EditCategoryModal isOpen={isEditModalOpen} categoryData={selectedCategory} onClose={() => { setIsEditModalOpen(false); setSelectedCategory(null); }} onRefresh={() => { refresh(); window.dispatchEvent(new Event('categoryUpdated')); }} />
        </>
    );
};

export default Categories;