'use client';

import React from 'react';
import { MoreHorizontal, Eye, Edit3, ShieldAlert, ShieldCheck, Trash2, Loader2 } from 'lucide-react';
import { Brand } from '../core/models/brandModel';
import * as BrandService from '../core/services/brandService';
import { BASE_URL } from '@/src/app/components/services/utils/config';

interface BrandMobileCardProps {
    brand: Brand;
    openActionId: number | null;
    setOpenActionId: (id: number | null) => void;
    handleViewClick: (brand: Brand) => void;
    handleEditClick: (brand: Brand) => void;
    handleToggleStatus: (brand: Brand) => void;
    handleDeleteClick: (brand: Brand) => void;
    statusLoadingId: number | null;
    deletingId: number | null;
}

const BrandMobileCard = ({
                             brand,
                             openActionId,
                             setOpenActionId,
                             handleViewClick,
                             handleEditClick,
                             handleToggleStatus,
                             handleDeleteClick,
                             statusLoadingId,
                             deletingId
                         }: BrandMobileCardProps) => {
    const isActive = brand.status?.toLowerCase() === 'active';

    return (
        <div className="rounded-2xl card-theme p-4 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 shrink-0 rounded-xl border border-gray-100 bg-white p-2 flex items-center justify-center overflow-hidden">
                    <img
                        src={BrandService.getFormattedImageUrl(brand.image ?? "", BASE_URL ?? "") ?? ""}
                        alt={brand.name}
                        className="max-h-full max-w-full object-contain"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[var(--header-text)] truncate">{brand.name}</p>
                    <p className="text-xs text-gray-400">{brand.products?.length || 0} Products</p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setOpenActionId(openActionId === brand.id ? null : brand.id)}
                        className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-all cursor-pointer"
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    {openActionId === brand.id && (
                        <div className="absolute right-0 top-10 z-20 bg-white border border-gray-100 rounded-xl shadow-xl py-1 min-w-[140px] dark:bg-[var(--header-bg)]">
                            <button
                                onClick={() => { handleViewClick(brand); setOpenActionId(null); }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors dark:text-gray-300 cursor-pointer"
                            >
                                <Eye size={16}/> View Details
                            </button>
                            <button
                                onClick={() => { handleEditClick(brand); setOpenActionId(null); }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-xs text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                                <Edit3 size={16}/> Edit
                            </button>

                            <button
                                onClick={() => { handleToggleStatus(brand); setOpenActionId(null); }}
                                disabled={statusLoadingId === brand.id}
                                className={`flex items-center gap-3 w-full px-4 py-2.5 text-xs transition-colors cursor-pointer ${
                                    isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-emerald-500 hover:bg-emerald-50'
                                }`}
                            >
                                {statusLoadingId === brand.id ? (
                                    <Loader2 size={16} className="animate-spin"/>
                                ) : isActive ? (
                                    <ShieldAlert size={16}/>
                                ) : (
                                    <ShieldCheck size={16}/>
                                )}
                                {isActive ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                                onClick={async () => { setOpenActionId(null); await handleDeleteClick(brand); }}
                                disabled={deletingId === brand.id}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                <Trash2 size={16}/> {deletingId === brand.id ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                    isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                }`}>
                    {brand.status || 'active'}
                </span>
                <span className="text-[10px] text-gray-400">ID: #{brand.id}</span>
            </div>
        </div>
    );
};

export default BrandMobileCard;