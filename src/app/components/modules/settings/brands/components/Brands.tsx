'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Plus, Filter, Eye, Edit3,Loader2,
    Trash2, ChevronDown, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SiBrandfetch } from "react-icons/si";
import { brandClient } from "@/src/app/components/modules/settings/brands/core/api/branhClient";
import { useBrandData } from "@/src/app/components/modules/settings/brands/core/hook/useBrandData";
import { INITIAL_BRAND_DATA, Brand } from "@/src/app/components/modules/settings/brands/core/models/brandModel";
import { BASE_URL } from '@/src/app/components/services/utils/config';
import * as BrandService from "@/src/app/components/modules/settings/brands/core/services/brandService";
import AddBrandModal from "./AddBrandModal";
import EditBrandModal from "@/src/app/components/modules/settings/brands/components/EditBrandModal";
import BrandDetailPage from "@/src/app/components/modules/settings/brands/components/BrandDetails";
import { useAlert } from "@/src/app/components/context/AlertContext";
import Pagination from "@/src/app/components/modules/settings/brands/components/Pagination";
import BrandMobileCard from "@/src/app/components/modules/settings/brands/components/BrandMobileCard";

const ITEMS_PER_PAGE = 8;

const Brands = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { showToast, showConfirm } = useAlert();

    const { data, loading, error, refetchData } = useBrandData(
        brandClient.fetchBrands,
        INITIAL_BRAND_DATA,
        true
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [openActionId, setOpenActionId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);

    const [viewingBrandId, setViewingBrandId] = useState<number | null>(() => {
        const id = searchParams.get('id');
        return id ? parseInt(id, 10) : null;
    });

    useEffect(() => {
        const id = searchParams.get('id');
        setViewingBrandId(id ? parseInt(id, 10) : null);
    }, [searchParams]);

    const handleToggleStatus = async (brand: Brand) => {
        const currentStatus = brand.status?.toLowerCase();
        const actionLabel = currentStatus === 'active' ? 'Deactivate' : 'Activate';

        const confirmed = await showConfirm({
            title: `${actionLabel} Brand`,
            message: `Are you sure you want to ${actionLabel.toLowerCase()} "${brand.name}"?`,
            confirmLabel: actionLabel,
            variant: currentStatus === 'active' ? "warning" : "info",
        });

        if (!confirmed) return;

        setStatusLoadingId(brand.id);
        try {
            const { response, newStatus } = await BrandService.toggleBrandStatusLogic(brand);
            if (!response.error) {
                showToast(`Status updated to ${newStatus}`, "success");
                refetchData();
            } else {
                showToast(response.error.message || "Failed to update status", "error");
            }
        } catch (err) {
            showToast("An unexpected error occurred", "error");
        } finally {
            setStatusLoadingId(null);
        }
    };

    const handleDeleteClick = async (brand: Brand) => {
        const confirmed = await showConfirm({
            title: "Delete Brand",
            message: `Are you sure you want to delete "${brand.name}"? This action cannot be undone.`,
            confirmLabel: "Delete",
            variant: "danger"
        });

        if (confirmed) {
            setDeletingId(brand.id);
            try {
                const response = await brandClient.deleteBrand(brand.id);
                if (!response.error) {
                    showToast("Brand deleted successfully", "success");
                    refetchData();
                } else {
                    showToast(response.error.message || "Failed to delete brand", "error");
                }
            } catch (err) {
                showToast("An unexpected error occurred", "error");
            } finally {
                setDeletingId(null);
            }
        }
    };

    const filteredBrands = useMemo(() => {
        return BrandService.filterBrandsList(data?.brands || [], searchQuery, statusFilter);
    }, [data, searchQuery, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredBrands.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);

    const paginatedBrands = useMemo(() => {
        return filteredBrands.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
    }, [filteredBrands, safePage]);

    const handleViewClick = (brand: Brand) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('id', brand.id.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleBackFromDetail = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('id');
        router.push(pathname);
    };

    if (viewingBrandId !== null) {
        return (
            <>
                <BrandDetailPage
                    brandId={viewingBrandId}
                    onBack={handleBackFromDetail}
                    onEdit={(brand: Brand) => { setEditingBrand(brand); setIsModalOpen(true); }}
                />
                {isModalOpen && editingBrand && (
                    <EditBrandModal
                        isOpen={isModalOpen}
                        initialData={editingBrand}
                        onClose={() => { setIsModalOpen(false); setEditingBrand(null); }}
                        onRefresh={refetchData}
                    />
                )}
            </>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full custom-main-color-card text-cyan-500">
                    <SiBrandfetch size={22} className="custom-main-color-icon"/>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--header-text)]">Brands</h1>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">Manage product brands and their associations.</p>
                </div>
                <div className="w-full sm:w-auto">
                    <button
                        onClick={() => { setEditingBrand(null); setIsModalOpen(true); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full custom-main-color-button custom-main-color-button-hover px-6 py-2.5 text-sm font-bold text-white transition-all cursor-pointer"
                    >
                        <Plus size={18}/> Add Brand
                    </button>
                </div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row items-center gap-3 rounded-[20px] card-theme p-3 shadow-sm border border-gray-100">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search brands by name..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full rounded-[20px] input-theme py-3 pl-11 pr-4 text-base outline-none shadow-sm"
                    />
                </div>
                <div className="relative w-full sm:w-48">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full appearance-none pl-11 pr-10 py-3 card-theme rounded-[20px] text-base font-bold text-slate-500 outline-none cursor-pointer shadow-sm"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin custom-main-color-text mb-2" size={32} />
                </div>
            ) : error ? (
                <div className="py-10 text-center text-red-500 text-sm font-medium">
                    Error loading brands: {error.message}
                </div>
            ) : (
                <>
                    <div className="mt-6 hidden md:block overflow-hidden rounded-xl card-theme">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-[14px] font-semibold text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Logo</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Products</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {paginatedBrands.map((brand) => (
                                <tr key={brand.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="sm:w-12 sm:h-12 w-10 h-10 rounded-lg border border-gray-100 bg-white p-1.5 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={BrandService.getFormattedImageUrl(brand.image ?? "", BASE_URL ?? "") ?? ""}
                                                alt={brand.name}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-[var(--header-text)]">{brand.name}</td>
                                    <td className="px-6 py-4 text-[var(--header-text)]">{brand.products?.length || 0} Products</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-[20px] px-2 py-1 text-[10px] font-bold uppercase ${
                                            brand.status?.toLowerCase() === 'active' ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {brand.status || 'active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleViewClick(brand)} className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-all cursor-pointer"><Eye size={14}/></button>
                                            <button onClick={() => { setEditingBrand(brand); setIsModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-all cursor-pointer"><Edit3 size={14}/></button>

                                            <button
                                                onClick={() => handleToggleStatus(brand)}
                                                disabled={statusLoadingId === brand.id}
                                                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                                                    brand.status?.toLowerCase() === 'active'
                                                        ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-50'
                                                        : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
                                                }`}
                                            >
                                                {statusLoadingId === brand.id ? (
                                                    <Loader2 size={14} className="animate-spin"/>
                                                ) : brand.status?.toLowerCase() === 'active' ? (
                                                    <ShieldAlert size={14}/>
                                                ) : (
                                                    <ShieldCheck size={14}/>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleDeleteClick(brand)}
                                                disabled={deletingId === brand.id}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all cursor-pointer disabled:opacity-50">
                                                {deletingId === brand.id ?
                                                    <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Grid */}
                    <div className="md:hidden grid grid-cols-1 gap-4 mt-4">
                        {paginatedBrands.map((brand) => (
                            <BrandMobileCard
                                key={brand.id}
                                brand={brand}
                                openActionId={openActionId}
                                setOpenActionId={setOpenActionId}
                                handleViewClick={handleViewClick}
                                handleEditClick={(b) => { setEditingBrand(b); setIsModalOpen(true); }}
                                handleToggleStatus={handleToggleStatus}
                                handleDeleteClick={handleDeleteClick}
                                statusLoadingId={statusLoadingId}
                                deletingId={deletingId}
                            />
                        ))}
                    </div>

                    {filteredBrands.length === 0 && (
                        <div className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                            <SiBrandfetch className="w-12 h-12 text-gray-300"/>
                            <span>No brands found.</span>
                        </div>
                    )}

                    {/* BOTTOM PACK (Total Items & Pagination) */}
                    {filteredBrands.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-4 gap-4">
                            <div className="text-sm text-gray-500 font-medium">
                                Total items: <span className="font-bold text-emerald-500">{filteredBrands.length}</span><span
                                className="px-1">Brands</span>
                            </div>
                            {/* Navigation Component */}
                            <Pagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
            )}

            {isModalOpen && !editingBrand && (
                <AddBrandModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={refetchData} />
            )}
            {isModalOpen && editingBrand && (
                <EditBrandModal isOpen={isModalOpen} initialData={editingBrand} onClose={() => { setIsModalOpen(false); setEditingBrand(null); }} onRefresh={refetchData} />
            )}
        </div>
    );
};

export default Brands;