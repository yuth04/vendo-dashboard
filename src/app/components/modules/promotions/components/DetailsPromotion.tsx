"use client";

import React, { useMemo, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Tag,
    Link as LinkIcon,
    Edit2,
    Trash2,
    ChevronRight,
    Clock,
    Package,
    Settings
} from 'lucide-react';
import { useApiData } from "@/src/app/components/services/utils/customHook";
import { useAlert } from "@/src/app/components/context/AlertContext";
import EditPromotion from "@/src/app/components/modules/promotions/components/EditPromotion";
import AddProducts from "@/src/app/components/modules/promotions/components/AddProducts";
import { promotionService } from "@/src/app/components/modules/promotions/core/services/promotionService";
import {productClient} from "@/src/app/components/modules/products/core/api/productClient";
import {PageLoader} from "@/src/app/components/helpers/components/PageLoader";
import {DataNotFound} from "@/src/app/components/helpers/components/DataNotFound";



const DetailsPromotion = () => {
    const { id } = useParams();
    const router = useRouter();
    const { showConfirm, showToast } = useAlert();

    const [isEditPromoOpen, setIsEditPromoOpen] = useState(false);
    const [isAddProductsOpen, setIsAddProductsOpen] = useState(false);

    const fetcher = useCallback(() => {
        if (!id) return Promise.reject("No ID");
        return promotionService.fetchPromotionById(Number(id));
    }, [id]);

    const { data, loading, refetchData } = useApiData<any>(
        fetcher,
        { data: null },
        true
    );

    const fetchAllProducts = useCallback(() => {
        return productClient.fetchProducts();
    }, []);

    const { data: productsData } = useApiData<any>(
        fetchAllProducts,
        { product: [] }, // Updated default state structure matching your backend response
        true
    );

    const promotion = useMemo(() => data?.data || null, [data]);

    // 🎯 FIX: Pull from productsData.product or productsData.data depending on structure
    const allAvailableProducts = useMemo(() => {
        if (!productsData) return [];
        if (Array.isArray(productsData.product)) return productsData.product;
        if (Array.isArray(productsData.data)) return productsData.data;
        if (Array.isArray(productsData)) return productsData;
        return [];
    }, [productsData]);

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

    const handleEditPromoClick = () => {
        if (isStaff) {
            showToast("Only super-admin and admin can edit promotions.", "error");
            return;
        }
        setIsEditPromoOpen(true);
    };

    const handleAddProductsClick = () => {
        if (isStaff) {
            showToast("Only super-admin and admin can add products to promotion.", "error");
            return;
        }
        setIsAddProductsOpen(true);
    };

    const handleDelete = async () => {
        if (isStaff) {
            showToast("Only super-admin and admin can delete promotions.", "error");
            return;
        }

        const confirmed = await showConfirm({
            title: "Delete Discounts?",
            message: "This will permanently remove this promotion and its links. This action cannot be undone.",
            variant: "danger"
        });

        if (confirmed && promotion) {
            try {
                const res = await promotionService.deleteDiscount(Number(promotion.id));

                if (!res.error) {
                    showToast("Campaign deleted successfully", "success");
                    router.push('/admin/promotions');
                } else {
                    showToast(res.error.message || "Failed to delete", "error");
                }
            } catch (err) {
                showToast("An unexpected error occurred", "error");
            }
        }
    };

    if (loading) {
        return (
            <PageLoader/>
        );
    }

    if (!promotion && !loading) {
        return (
            <DataNotFound
                title="Promotions Not Found"
                message="We couldn't find any promotions matching your search criteria."
                icon={(() => (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-megaphone"
                    >
                        <path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>
                        <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/>
                        <path d="M8 6v8"/>
                    </svg>
                )) as any}
            />
        );
    }

    return (
        <div className="min-h-screen sm:p-4 py-4 md:p-8">
            {/* Modals */}
            {isEditPromoOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <EditPromotion
                        data={promotion}
                        onClose={() => setIsEditPromoOpen(false)}
                        onSuccess={() => { refetchData(); setIsEditPromoOpen(false); }}
                    />
                </div>
            )}

            {isAddProductsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <AddProducts
                        categoryData={promotion}
                        allDiscounts={[promotion]}
                        allProducts={allAvailableProducts}
                        onClose={() => setIsAddProductsOpen(false)}
                        onSuccess={() => { refetchData(); setIsAddProductsOpen(false); }}
                    />
                </div>
            )}

            <nav className="flex items-center gap-2 text-[12px] sm:text-[14px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
                <span className="custom-main-color-text-hover cursor-pointer" onClick={() => router.push('/admin/dashboard')}>Dashboard</span>
                <ChevronRight size={12} strokeWidth={3} className="shrink-0"/>
                <span className="custom-main-color-text-hover cursor-pointer" onClick={() => router.push('/admin/promotions')}>Promotions</span>
                <ChevronRight size={12} strokeWidth={3} className="shrink-0"/>
                <span className="text-[var(--header-text)]">Promotions Details</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3 md:gap-4">
                    <button onClick={() => router.back()} className="p-2.5 md:p-3 card-theme rounded-full shadow-sm hover:bg-gray-50 transition-all text-gray-400 cursor-pointer">
                        <ChevronLeft size={24} className="text-[var(--header-text)]"/>
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-[24px] md:text-[30px] font-black text-[var(--header-text)] tracking-tight truncate">{promotion?.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] md:text-[10px] font-black text-blue-600  bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider border border-blue-100">
                                {promotion?.slug}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <button
                        onClick={handleEditPromoClick}
                        className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 custom-main-color-button custom-main-color-button-hover text-white rounded-[20px] text-[12px] sm:text-[14px] font-black cursor-pointer ${
                            isStaff ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <Edit2 size={16}/> Edit Promotions
                    </button>
                    <button
                        onClick={handleDelete}
                        className={`px-3 py-2 sm:px-4 sm:py-3 bg-white border rounded-2xl shadow-sm transition-all ${
                            isStaff ? 'opacity-25 border-gray-100 text-gray-400 cursor-not-allowed' : 'border-red-50 text-red-500 hover:bg-red-50 cursor-pointer'
                        }`}
                    >
                        <Trash2 size={18}/>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
                <div className="xl:col-span-2 space-y-6 md:space-y-8">
                    <div className="card-theme rounded-[32px] md:rounded-[40px] p-5 md:p-10 shadow-sm relative overflow-hidden">
                        <div className="relative w-full h-[200px] md:h-[320px] rounded-[24px] md:rounded-[32px] overflow-hidden mb-6 md:mb-10 group bg-gray-50">
                            <img src={promotion?.banner_image || '/placeholder.png'} alt="Banner" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute top-3 left-3 md:top-4 md:left-4">
                                <span className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black border uppercase tracking-widest backdrop-blur-md shadow-lg ${promotion?.is_active ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-gray-500/90 text-white border-gray-400'}`}>
                                    {promotion?.is_active ? '● Active' : '○ Inactive'}
                                </span>
                            </div>
                        </div>

                        <div className="mb-8 md:mb-10">
                            <h3 className="text-[14px] md:text-[18px] font-black text-[var(--header-text)] mb-2 md:mb-3">About Promotions</h3>
                            <p className="text-base md:text-lg font-bold text-[var(--header-text)] leading-relaxed">{promotion?.description || "No description provided."}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-4 p-4 md:p-5 card-theme rounded-[24px]">
                                <div className="p-2.5 md:p-3 bg-emerald-50 text-emerald-500 rounded-2xl"><Tag size={20} /></div>
                                <div>
                                    <p className="text-[10px] md:text-[12px] font-black text-[var(--header-text)] uppercase tracking-widest mb-0.5">Discount Value</p>
                                    <p className="text-sm font-black text-gray-400">{promotion?.amount}% {promotion?.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 md:p-5 card-theme rounded-[24px]">
                                <div className="p-2.5 md:p-3 text-blue-600  bg-blue-50  rounded-2xl"><LinkIcon size={20} /></div>
                                <div>
                                    <p className="text-[10px] md:text-[12px] font-black text-[var(--header-text)] uppercase tracking-widest mb-0.5">Slug</p>
                                    <p className="text-sm font-black text-gray-400 truncate max-w-[120px]">/{promotion?.slug}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg md:text-xl font-black text-[var(--header-text)] tracking-tight">Promoted Products</h3>
                            <span className="text-[10px] md:text-[12px] font-black text-[var(--header-text)] uppercase tracking-[0.2em]">{promotion?.products?.length || 0} Items</span>
                        </div>

                        <div className="card-theme rounded-[28px] md:rounded-[32px] overflow-hidden shadow-sm">
                            <div className="px-5 md:px-8 py-4 md:py-5 custom-main-color-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 md:p-2.5 bg-emerald-100 custom-main-color-icon rounded-xl"><Package size={18} /></div>
                                    <div>
                                        <h4 className="font-black text-[var(--header-text)] text-[14px] md:text-[16px] uppercase tracking-wide truncate max-w-[180px]">{promotion?.name}</h4>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">
                                            <span className="text-emerald-500">{promotion?.amount}% {promotion?.type}</span>
                                            <span className="hidden xs:inline w-1 h-1 bg-gray-300 rounded-full" />
                                            <span>{promotion?.end_date ? `Ends ${promotion.end_date}` : 'No Expiry'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddProductsClick}
                                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 card-theme rounded-xl text-[12px] md:text-[14px] font-black text-[var(--header-text)] transition-all shadow-sm cursor-pointer ${
                                        isStaff ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <Settings size={14} className="custom-main-color-icon" /> Add Products
                                </button>
                            </div>

                            <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                {promotion?.products?.length > 0 ? (
                                    promotion.products.map((product: any) => (
                                        <div key={product.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl card-theme hover:border-emerald-100 hover:bg-emerald-50/20 transition-all group">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl card-theme p-1.5 md:p-2 shrink-0 overflow-hidden shadow-sm">
                                                <img src={product.image} className="w-full h-full object-contain" alt={product.productName} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] md:text-[14px] font-bold text-[var(--header-text)] truncate">{product.productName}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-sm font-black text-[var(--header-text)]">${product.discount_price}</span>
                                                    <span className="text-[11px] md:text-[12px] text-gray-400 line-through font-bold">${product.price}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-6 text-center text-gray-400 text-[10px] md:text-xs font-bold tracking-widest italic uppercase">
                                        No products in Promotion.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-1 space-y-6">
                    <div className="card-theme rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-sm">
                        <h3 className="text-lg font-black text-[var(--header-text)] mb-6">Slug</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest block mb-2">Tracking ID</label>
                                <div className="card-theme rounded-xl p-4 text-[12px] md:text-[13px] font-bold text-slate-500 break-all leading-relaxed uppercase">
                                    PROM_UID_{promotion?.id}_{promotion?.slug?.replace(/-/g, '_')}
                                </div>
                            </div>
                            <div className="pt-6 border-t border-gray-100 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Clock size={14}/>
                                        <span className="text-[12px] font-bold uppercase tracking-tight">
                                            Timeline
                                        </span>
                                    </div>

                                    <div
                                        className="text-[12px] font-black text-[var(--header-text)] flex flex-col sm:items-end">
                                        <span>Start : {promotion?.start_date || "N/A"}</span>
                                        <span>End : {promotion?.end_date || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-theme rounded-[28px] md:rounded-[32px] p-6 md:p-8 text-white shadow-xl">
                        <p className="text-[14px] font-black uppercase tracking-widest text-[var(--header-text)] mb-1">Total
                            Products</p>
                        <h4 className="text-2xl md:text-3xl text-[var(--header-text)] font-black mb-3">
                            {promotion?.products?.length || 0}
                        </h4>
                        <p className="text-[14px] font-bold leading-relaxed text-gray-400">Products benefited by this
                            promotions.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailsPromotion;