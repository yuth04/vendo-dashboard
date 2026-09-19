'use client';

import React, { useCallback, useEffect } from 'react';
import {ArrowLeft, Edit3, Layers, Loader2, AlertCircle, CheckCircle2, ChevronRight} from 'lucide-react';
import { useApiData } from "@/src/app/components/services/utils/customHook";
import {useRouter} from "next/navigation";
import * as ParentCategoriesService from "../core/services/parentCategoriesService";

interface ParentCategoryDetailPageProps {
    categoryId: number;
    onBack: () => void;
    onEdit: (category: any) => void;
}

const ParentCategoryDetail = ({ categoryId, onBack, onEdit }: ParentCategoryDetailPageProps) => {

    const router = useRouter();

    const fetchCategory = useCallback(
        (signal?: AbortSignal) => {
            return ParentCategoriesService.fetchParentCategoryByIdLogic(categoryId);
        },
        [categoryId]
    );

    const { data, loading, error, refetchData: refresh } = useApiData(
        fetchCategory,
        null,
        true
    );

    useEffect(() => {
        const handleUpdate = () => {
            refresh();
        };
        window.addEventListener('categoryUpdated', handleUpdate);
        return () => window.removeEventListener('categoryUpdated', handleUpdate);
    }, [refresh]);

    const category = data?.data || data;


    if (loading && !category) {
        return (
            <div className="min-h-screen py-2 px-4 sm:px-0 animate-in fade-in duration-500 animate-pulse">
                <div className="hidden sm:block h-4 w-48 bg-gray-200 rounded-md mb-6" />

                <div className="flex items-start gap-4 mb-8">
                    <div className="h-9 w-9 bg-gray-200 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-8 w-1/2 sm:w-64 bg-gray-200 rounded-lg" />
                        <div className="h-4 w-32 sm:w-40 bg-gray-100 rounded-md" />
                    </div>
                    <div className="h-10 w-20 sm:w-24 bg-gray-200 rounded-full shrink-0" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden h-[300px] sm:h-[400px]">
                        <div className="h-32 sm:h-48 bg-gray-50 flex items-center justify-center">
                            <Layers className="text-gray-200" size={48} />
                        </div>
                        <div className="p-6 sm:p-8 space-y-4">
                            <div className="h-8 w-3/4 bg-gray-100 rounded-lg" />
                            <div className="h-4 w-full bg-gray-50 rounded-md" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-24 sm:h-32 bg-white border border-gray-100 rounded-2xl" />
                        <div className="h-24 sm:h-32 bg-white border border-gray-100 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (error && !category) {
        return (
            <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center gap-4 text-center">
                <AlertCircle className="text-red-400" size={40} />
                <p className="text-red-500 font-bold text-sm">Failed to load: {error.message}</p>
                <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 underline cursor-pointer">← Go back</button>
            </div>
        );
    }

    const isActive = category?.status === true;

    return (
        <div className="min-h-screen py-2 px-4 sm:px-0 animate-in fade-in duration-500">

            <nav className="flex items-center gap-1.5 text-[12px] text-gray-400 font-medium mb-6 overflow-x-auto no-scrollbar pb-1">
                <span
                    className="custom-main-color-text-hover cursor-pointer whitespace-nowrap"
                    onClick={() => router.push('/admin/dashboard')}
                >
                    Dashboard
                </span>
                <ChevronRight size={12} strokeWidth={3} className="shrink-0"/>
                <span
                    className="custom-main-color-text-hover cursor-pointer whitespace-nowrap"
                    onClick={() => router.push('/admin/settings/parent-category')}
                >
                     Parent Category
                </span>
                <ChevronRight size={12} strokeWidth={3} className="shrink-0"/>
                <span className="text-[var(--header-text)] whitespace-nowrap">
                    ParentCategory Details
                </span>
            </nav>

            {/* Header Section - Responsive Wrap */}
            <div className="flex flex-wrap items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                    onClick={onBack}
                    className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border card-theme text-gray-400 bg-white transition-all shadow-sm cursor-pointer hover:bg-gray-50 active:scale-90"
                >
                    <ArrowLeft size={16}/>
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--header-text)] truncate">
                                {category?.name || ""}
                            </h1>
                            {loading && <Loader2 className="animate-spin text-blue-400" size={16}/>}
                        </div>
                        <span
                            className={`w-fit inline-flex items-center rounded-full px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                                isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-100 border-gray-200 text-gray-400'
                            }`}>
                            {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                    </div>
                    <p className="text-[11px] sm:text-sm text-gray-400 mt-0.5">View parent category information and
                        hierarchy</p>
                </div>

                <div className="w-full sm:w-auto mt-2 sm:mt-0">
                    <button
                        onClick={() => {
                            if (category) {
                                onEdit({
                                    ...category,
                                    id: Number(category.id || categoryId)
                                });
                            }
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full custom-main-color-button px-5 py-2.5 text-sm font-bold text-white cursor-pointer shrink-0 shadow-sm transition-transform active:scale-95"
                    >
                        <Edit3 size={14}/>
                        Edit Parent Category
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

                <div className="rounded-2xl card-theme bg-white overflow-hidden border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-center border-b border-gray-50 p-8 sm:p-12 bg-gray-50/30">
                        <div className="flex flex-col items-center gap-3 custom-main-color-icon">
                            <Layers className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={1.5}/>
                            <span
                                className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Parent Category</span>
                        </div>
                    </div>
                    <div className="p-5 sm:p-8">
                        <h2 className="text-2xl sm:text-4xl font-black text-[var(--header-text)] mb-2">{category?.name}</h2>
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed italic">
                            {category?.description || "No description available for this category."}
                        </p>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-4">
                    {/* Overview Card */}
                    <div className="rounded-2xl card-theme bg-white p-5 border border-gray-100 shadow-sm">
                        <p className="text-[14px] font-black text-gray-400 mb-4">Overview</p>
                        <div className="flex items-center gap-3 p-3 rounded-xl card-theme shadow-sm">
                            <div
                                className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl custom-main-color-icon text-blue-500 card-theme">
                                <Layers size={18}/>
                            </div>
                            <span className="flex-1 text-xs sm:text-sm font-bold text-[var(--header-text)]">Sub Categories</span>
                            <span className="text-xs sm:text-sm font-black text-[var(--header-text)]">
                                {category?.categories?.length || 0}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl card-theme bg-white p-5 border border-gray-100 shadow-sm">
                        <p className="text-[14px] font-black text-gray-400 mb-4">Status Info</p>
                        <div className="flex items-center gap-3 p-3 rounded-xl card-theme ">
                            <div
                                className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl ${isActive ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-gray-400 bg-gray-100'}`}>
                                <CheckCircle2 size={18}/>
                            </div>
                            <span className="flex-1 text-xs sm:text-sm font-bold text-gray-500">Status</span>
                            <span
                                className="text-[10px] sm:text-xs font-black uppercase text-gray-500">{isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>

                    <div className="rounded-2xl card-theme bg-white p-5 border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-4">Category
                            Info</p>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.12em] text-gray-400 mb-1">Internal
                                    ID</p>
                                <p className="text-[10px] sm:text-xs font-mono text-gray-500 font-bold">#{category?.id || categoryId}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentCategoryDetail;