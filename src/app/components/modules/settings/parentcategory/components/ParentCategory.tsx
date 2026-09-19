'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import AddParentCategoryModal from "@/src/app/components/modules/settings/parentcategory/components/AddParentCategoryModal";
import {
    Edit3,
    Layers,
    Loader2,
    Plus,
    MoreHorizontal,
    Trash2,
    Eye,
    ShieldCheck,
    ShieldAlert,
    Search, Filter, ChevronDown
} from "lucide-react";
import EditParentCategoryModal from "@/src/app/components/modules/settings/parentcategory/components/EditParentCategoryModal";
import { useAlert } from "@/src/app/components/context/AlertContext";
import ParentCategoryDetailPage from "@/src/app/components/modules/settings/parentcategory/components/ParentCategoryDetail";
import {
    INITIAL_CATEGORY_DATA,
    ParentCategoryResponse
} from "@/src/app/components/modules/settings/parentcategory/core/models/parentCategoriesModel";
import {useparentCategoriesData} from "@/src/app/components/modules/settings/parentcategory/core/hook/useparentCategoriesData";
import {parentcategoriesClient} from "@/src/app/components/modules/settings/parentcategory/core/api/parentCategoriesClient";
import * as ParentCategoriesService from "../core/services/parentCategoriesService";
import Pagination from "./Pagination";


const ParentCategories = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { showToast, showConfirm } = useAlert();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [openActionId, setOpenActionId] = useState<number | null>(null);
    const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Statuses");

    const viewingId = searchParams.get('view') ? Number(searchParams.get('view')) : null;

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const { data, loading, refetchData: refresh } = useparentCategoriesData<ParentCategoryResponse>(
        parentcategoriesClient.fetchParentcategories,
        INITIAL_CATEGORY_DATA,
        true
    );

    const parentcategoriesList = data?.data || [];

    const filteredList = useMemo(() => {
        return ParentCategoriesService.filterParentCategories(parentcategoriesList, searchQuery, statusFilter);
    }, [parentcategoriesList, searchQuery, statusFilter]);

    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const safePage = Math.min(currentPage, totalPages || 1);

    const currentItems = useMemo(() => {
        const indexOfLastItem = safePage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredList.slice(indexOfFirstItem, indexOfLastItem);
    }, [safePage, filteredList]);

    const setViewingId = (id: number | null) => {
        const params = new URLSearchParams(searchParams);
        if (id) params.set('view', id.toString());
        else params.delete('view');
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleEditClick = (category: any) => {
        setSelectedCategory(category);
        setIsEditModalOpen(true);
        setOpenActionId(null);
    };

    const handleToggleStatus = async (cat: any) => {
        const newStatus = !cat.status;
        const confirmed = await showConfirm({
            title: `${newStatus ? 'Activate' : 'Deactivate'} Category`,
            message: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this category?`,
            confirmLabel: newStatus ? "Activate" : "Deactivate",
            cancelLabel: "Cancel",
            variant: newStatus ? "info" : "warning"
        });

        if (!confirmed) return;

        setStatusLoadingId(cat.id);
        try {
            const response = await ParentCategoriesService.toggleParentCategoryStatusLogic(cat, newStatus);

            if (response.error) {
                const errorData = response.error as any;
                const errMsg = errorData.errors
                    ? Object.values(errorData.errors).flat().join(', ')
                    : (errorData.message || "Failed to update status");
                showToast(errMsg, "error");
            } else {
                showToast(`Category ${newStatus ? 'activated' : 'deactivated'} successfully!`, "success");
                refresh();
                setOpenActionId(null);
            }
        } catch (err: any) {
            showToast("An error occurred during update", "error");
        } finally {
            setStatusLoadingId(null);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm({
            title: "Delete Category",
            message: "Are you sure you want to delete this category? This action cannot be undone.",
            confirmLabel: "Delete",
            cancelLabel: "Cancel",
            variant: "danger"
        });
        if (!confirmed) return;
        try {
            const response = await ParentCategoriesService.deleteParentCategoryLogic(id);
            if (response.error) {
                const errorData = response.error as any;
                const errMsg = errorData.errors
                    ? Object.values(errorData.errors).flat().join(', ')
                    : (errorData.message || "Delete failed");
                showToast(errMsg, "error");
            } else {
                showToast("Category deleted successfully!", "success");
                refresh();
                setOpenActionId(null);
            }
        } catch (err: any) {
            showToast("An error occurred during deletion", "error");
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-8">
            {viewingId ? (
                <ParentCategoryDetailPage
                    categoryId={viewingId}
                    onBack={() => setViewingId(null)}
                    onEdit={handleEditClick}
                />
            ) : (
                <>
                    {/* Header */}
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <div
                            className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full custom-main-color-card text-cyan-500">
                            <Layers className="custom-main-color-icon"/>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <h1 className="text-xl sm:text-2xl font-bold text-[var(--header-text)]">Parent Categories</h1>
                            <p className="text-xs sm:text-sm text-gray-500">Manage product categories and hierarchy.</p>
                        </div>

                        <div className="w-full sm:w-auto">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full custom-main-color-button px-6 py-2.5 text-sm font-bold text-white transition-all cursor-pointer"
                            >
                                <Plus size={18}/> Add ParentCategory
                            </button>
                        </div>
                    </div>

                    <div
                        className="mt-8 flex flex-col md:flex-row items-center gap-3 rounded-[20px] card-theme p-3 shadow-sm border border-gray-100">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input type="text" value={searchQuery} onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }} placeholder="Search categories by name..."
                                   className="w-full rounded-[20px] input-theme py-3 pl-11 pr-4 text-base outline-none shadow-sm"/>
                        </div>
                        <div className="relative group min-w-[180px] w-full md:w-auto">
                            <select value={statusFilter} onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                                    className="w-full appearance-none pl-11 pr-10 py-3 card-theme rounded-[20px] text-base font-bold text-slate-500 outline-none cursor-pointer shadow-sm">
                                <option value="All Statuses">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <ChevronDown size={16}
                                         className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin custom-main-color-icon mb-2" size={32}/>
                        </div>
                    )}

                    {/* Desktop Table View */}
                    {!loading && currentItems.length > 0 && (
                        <div
                            className="mt-6 hidden md:block overflow-hidden rounded-xl border border-gray-100 card-theme bg-white">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-[14px] font-semibold text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {currentItems.map((cat: any) => (
                                    <tr key={cat.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-[var(--header-text)]">
                                            {cat.name}
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className={`rounded-[20px] px-2 py-1 text-[10px] font-bold ${
                                                    cat.status === true
                                                        ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                                                        : "bg-gray-100 text-gray-400"
                                                }`}>
                                                    {cat.status ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div
                                                className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setViewingId(cat.id)}
                                                        className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-all cursor-pointer">
                                                    <Eye size={14}/>
                                                </button>
                                                <button onClick={() => handleEditClick(cat)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-all cursor-pointer">
                                                    <Edit3 size={14}/>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(cat)}
                                                    disabled={statusLoadingId === cat.id}
                                                    className={`p-1.5 rounded-md transition-all cursor-pointer ${
                                                        cat.status
                                                            ? 'text-orange-500 hover:bg-orange-50'
                                                            : 'text-emerald-500 hover:bg-emerald-50'
                                                    }`}
                                                >
                                                    {statusLoadingId === cat.id ?
                                                        <Loader2 size={14} className="animate-spin"/> : cat.status ?
                                                            <ShieldAlert size={14}/> : <ShieldCheck size={14}/>}
                                                </button>
                                                <button onClick={() => handleDelete(cat.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all cursor-pointer">
                                                    <Trash2 size={14}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Mobile Card View */}
                    {!loading && currentItems.length > 0 && (
                        <div className="md:hidden grid grid-cols-1 gap-3 mt-4">
                            {currentItems.map((cat: any) => (
                                <div key={cat.id} className="rounded-2xl card-theme p-4 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-gray-400 truncate">{cat.name}</p>
                                            <span
                                                className={`inline-block mt-1 rounded-[20px] px-2 py-0.5 text-[9px] font-bold ${
                                                    cat.status === true
                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                        : "bg-gray-100 text-gray-400"
                                                }`}>
                                                {cat.status ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenActionId(openActionId === cat.id ? null : cat.id)}
                                                className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-all"
                                            >
                                                <MoreHorizontal size={18}/>
                                            </button>
                                            {openActionId === cat.id && (
                                                <div
                                                    className="absolute right-0 top-10 z-10 bg-white border border-gray-100 rounded-xl shadow-xl py-1 min-w-[140px] overflow-hidden animate-in fade-in zoom-in duration-150">
                                                    <button onClick={() => setViewingId(cat.id)}
                                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-500 transition-colors">
                                                        <Eye size={14}/> View Details
                                                    </button>
                                                    <button onClick={() => handleEditClick(cat)}
                                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-500 transition-colors">
                                                        <Edit3 size={14}/> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(cat)}
                                                        className={`flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold transition-colors ${
                                                            cat.status
                                                                ? 'text-orange-500 hover:bg-orange-50'
                                                                : 'text-emerald-500 hover:bg-emerald-50'
                                                        }`}
                                                    >
                                                        {statusLoadingId === cat.id ?
                                                            <Loader2 size={14} className="animate-spin"/> : cat.status ?
                                                                <ShieldAlert size={14}/> : <ShieldCheck
                                                                    size={14}/>} {cat.status ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button onClick={() => handleDelete(cat.id)}
                                                            className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                                                        <Trash2 size={14}/> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* BOTTOM PACK (Total Items & Pagination) */}
                    {!loading && filteredList.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-4 gap-4">
                            <div className="text-sm text-gray-500 font-medium">
                                Total items: <span className="font-bold text-emerald-500">{filteredList.length}</span>
                                <span className="px-1">Parent Categories</span>
                            </div>

                            {/* Only render Pagination if total items exceed itemsPerPage */}
                            {filteredList.length > itemsPerPage && (
                                <Pagination
                                    currentPage={safePage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && filteredList.length === 0 && (
                        <div
                            className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                            <Layers className="w-12 h-12 text-gray-300"/>
                            <span> No parent categories found.</span>
                        </div>
                    )}
                </>
            )}

            <AddParentCategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRefresh={refresh}
            />

            <EditParentCategoryModal
                isOpen={isEditModalOpen}
                category={selectedCategory}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCategory(null);
                }}
                onRefresh={() => {
                    refresh();
                    window.dispatchEvent(new Event('categoryUpdated'));
                    setIsEditModalOpen(false);
                }}
            />
        </div>
    );
};

export default ParentCategories;