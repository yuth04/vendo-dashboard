'use client';

import React, { useCallback } from 'react';
import {ArrowLeft, Edit3, Package, AlertCircle, ChevronRight} from 'lucide-react';
import { INITIAL_BRAND_DETAIL } from "@/src/app/components/modules/settings/brands/core/models/brandModel";
import { BASE_URL } from '@/src/app/components/services/utils/config';
import { useRouter } from 'next/navigation';
import {brandClient} from "@/src/app/components/modules/settings/brands/core/api/branhClient";
import {useBrandData} from "@/src/app/components/modules/settings/brands/core/hook/useBrandData";
import * as BrandService from "@/src/app/components/modules/settings/brands/core/services/brandService";

interface BrandDetailPageProps {
    brandId: number;
    onBack: () => void;
    onEdit: (brand: any) => void;
}

const BrandDetailPage = ({ brandId, onBack, onEdit }: BrandDetailPageProps) => {

    const router = useRouter();

    const fetchBrand = useCallback(
        (signal?: AbortSignal) => {
            if (!brandId) return Promise.reject(new Error("Invalid Brand ID"));
            return brandClient.fetchBrandById(brandId, signal);
        },
        [brandId]
    );

    const { data, loading, error } = useBrandData(
        fetchBrand,
        INITIAL_BRAND_DETAIL,
        true
    );

    const brand = data?.brands;

    if (loading) {
        return (
            <div className="min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-3 w-20 rounded bg-gray-100 animate-pulse" />
                    <div className="h-3 w-3 rounded bg-gray-100 animate-pulse" />
                    <div className="h-3 w-16 rounded bg-gray-100 animate-pulse" />
                    <div className="h-3 w-3 rounded bg-gray-100 animate-pulse" />
                    <div className="h-3 w-14 rounded bg-gray-100 animate-pulse" />
                </div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-5 w-32 rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-48 rounded bg-gray-100 animate-pulse" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                    <div className="rounded-2xl card-theme p-8 space-y-6 animate-pulse">
                        <div className="h-56 rounded-xl bg-gray-100" />
                        <div className="h-8 w-32 rounded bg-gray-100" />
                        <div className="space-y-2">
                            <div className="h-3 w-full rounded bg-gray-50" />
                            <div className="h-3 w-5/6 rounded bg-gray-50" />
                            <div className="h-3 w-4/6 rounded bg-gray-50" />
                        </div>
                    </div>
                    <div className="space-y-4 animate-pulse">
                        <div className="h-28 rounded-2xl card-theme bg-gray-50" />
                        <div className="h-28 rounded-2xl card-theme bg-gray-50" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center gap-4">
                <AlertCircle className="text-red-400" size={40} />
                <p className="text-red-500 font-bold text-sm">Failed to load brand: {error.message}</p>
                <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 underline">← Go back</button>
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="min-h-screen p-4 flex flex-col items-center justify-center gap-4 text-center">
                <Package size={40} className="text-gray-200" />
                <p className="text-gray-500 font-bold">Brand Details Not Found</p>
                <button onClick={onBack} className="text-sm custom-main-color-text underline">Return to list</button>
            </div>
        );
    }

    const imageUrl = BrandService.getFormattedImageUrl(brand.image ?? "", BASE_URL ?? "");
    const isActive = brand.status?.toLowerCase() === 'active';

    return (
        <div className="min-h-screen py-2 px-4 sm:px-0">
            <nav className="flex items-center gap-1.5 text-[12px] text-gray-400 font-medium mb-6 overflow-x-auto no-scrollbar pb-1">
                <span className="custom-main-color-text-hover cursor-pointer whitespace-nowrap" onClick={() => router.push('/admin/dashboard')}>Dashboard</span>
                <ChevronRight size={12} strokeWidth={3} className="shrink-0"/>
                <span className="custom-main-color-text-hover cursor-pointer whitespace-nowrap" onClick={() => router.push('/admin/settings/brands')}>Brands</span>
                <ChevronRight size={12} strokeWidth={3} className="shrink-0"/>
                <span className="text-[var(--header-text)] whitespace-nowrap">Brands Details</span>
            </nav>

            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8">
                <div className="flex items-start gap-4 w-full">
                    <button onClick={onBack} className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border card-theme text-gray-400 bg-white transition-all shadow-sm cursor-pointer hover:bg-gray-50">
                        <ArrowLeft size={16}/>
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-2xl sm:text-4xl font-black text-[var(--header-text)] truncate tracking-tight">
                                {brand.name}
                            </h1>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                                {brand.status}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400 mt-0.5">View brand information and management options</p>
                    </div>
                </div>
                <div className="w-full sm:w-auto">
                    <button onClick={() => onEdit(brand)} className="flex items-center justify-center gap-2 rounded-full custom-main-color-button custom-main-color-button-hover w-full sm:px-8 px-6 py-3 text-sm font-bold text-white cursor-pointer shadow-md active:scale-95 transition-all whitespace-nowrap">
                        <Edit3 size={16}/>
                        <span>Edit Brand</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                <div className="rounded-2xl card-theme overflow-hidden bg-white border border-gray-100">
                    <div className="flex items-center justify-center border-b border-gray-100 p-8 sm:p-12 min-h-[200px] sm:min-h-[220px] bg-gray-50/30">
                        {imageUrl ? (
                            <img src={imageUrl} alt={brand.name} className="max-h-32 sm:max-h-36 max-w-full object-contain" />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-gray-300">
                                <Package size={48} strokeWidth={1} />
                                <span className="text-xs font-semibold uppercase tracking-widest">No Logo</span>
                            </div>
                        )}
                    </div>
                    <div className="p-6 sm:p-8">
                        <h2 className="text-2xl sm:text-4xl font-black text-[var(--header-text)] mb-5">{brand.name}</h2>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Description</p>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                {brand.description || "No description available for this brand."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl card-theme p-5 bg-white border border-gray-100">
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-4">Overview</p>
                        <div className="flex items-center gap-3 p-3 rounded-xl card-theme bg-gray-50/50">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-gray-100 text-blue-400 shadow-sm">
                                <Package size={18} />
                            </div>
                            <span className="flex-1 text-sm font-bold text-[var(--header-text)]">Products</span>
                            <span className="text-sm font-black text-[var(--header-text)]">{brand.products?.length ?? 0}</span>
                        </div>
                    </div>
                    <div className="rounded-2xl card-theme p-5 bg-white border border-gray-100">
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-4">Brand Info</p>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400 mb-1">Brand ID</p>
                                <p className="text-xs font-mono text-gray-500 break-all bg-gray-50 p-2 rounded-lg border border-gray-50">#{brand.id}</p>
                            </div>
                            {brand.slug && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400 mb-1">Slug Reference</p>
                                    <p className="text-xs font-mono text-blue-500 break-all bg-blue-50/30 p-2 rounded-lg border border-blue-50">{brand.slug}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandDetailPage;