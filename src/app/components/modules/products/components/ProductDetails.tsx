"use client";

import React, { useState, useEffect } from 'react';
import {
    Info,
    Image as ImageIcon,
    Layers,
    Tag, ChevronRight,
    Trash2,
} from 'lucide-react';
import { LuBox } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { Product, ProductVariant } from "@/src/app/components/modules/products/core/models/productModel";
import { productService } from "@/src/app/components/modules/products/core/services/productService";
import {useAlert} from "@/src/app/components/context/AlertContext";



interface ProductDetailsProps {
    product: Product;
    onBack: () => void;
}

const ProductDetails = ({ product, onBack }: ProductDetailsProps) => {
    const [activeTab, setActiveTab] = useState<'info' | 'images' | 'variation'>('info');
    const [mergedVariants, setMergedVariants] = useState<ProductVariant[]>(product.variants ?? []);
    const [deletingVariantId, setDeletingVariantId] = useState<number | null>(null);
    const router = useRouter();
    const { showToast, showConfirm } = useAlert();

    //--- SECURITY ROLE ARCHITECTURE SETUP ---//
    const currentUserRole = (() => {
        if (typeof window === 'undefined') return null;
        try {
            const raw = localStorage.getItem('auth_user');
            return raw ? JSON.parse(raw)?.role ?? null : null;
        } catch {
            return null;
        }
    })();

    const isSuperAdmin = currentUserRole === 'super-admin';
    const isAdmin = currentUserRole === 'admin';

    //-- Can Delete:super-admin & admin only. staff cannot.--//
    const canDelete = isSuperAdmin || isAdmin;

    useEffect(() => {
        const controller = new AbortController();

        productService.getVariants(controller.signal).then((res) => {
            const allVariants: ProductVariant[] = res.data?.product_variant ?? [];
            const productVariants = allVariants.filter(v => v.product_id === product.id);

            const merged = (product.variants ?? []).map(pv => {
                const fetched = productVariants.find(fv => fv.id === pv.id);
                return fetched ? { ...pv, images: fetched.images ?? [] } : pv;
            });

            setMergedVariants(merged);
        }).catch(() => {
            // keep existing variants on error / abort
        });

        return () => controller.abort();
    }, [product.id]);

    const handleDeleteVariant = async (variantId: number | undefined) => {
        if (!variantId) return;

        if (!canDelete) {
            showToast("Only super-admin and admin can delete product.", "error");
            return;
        }

        const confirmed = await showConfirm({
            title: "Delete Variant",
            message: "Are you sure you want to delete this product variant? This action cannot be undone.",
            confirmLabel: "Delete",
            cancelLabel: "Cancel",
            variant: "danger"
        });

        if (confirmed) {
            try {
                setDeletingVariantId(variantId);
                await productService.deleteVariant(variantId);
                setMergedVariants(prev => prev.filter(v => v.id !== variantId));
                showToast("Variant deleted successfully", "success");
            } catch (error) {
                console.error("Failed to delete variant:", error);
                showToast("Failed to delete product variant", "error");
            } finally {
                setDeletingVariantId(null);
            }
        }
    };

    if (!product) return null;

    const totalStock = productService.getTotalStock(product);
    const allVariantImages = mergedVariants.flatMap(v => v.images ?? []);

    return (
        <div className="min-h-screen sm:p-4 py-4 md:p-8">
            <div className="">
                <nav
                    className="flex items-center gap-2 text-[12px] sm:text-[14px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
                    <span
                        className="custom-main-color-text-hover cursor-pointer whitespace-nowrap"
                        onClick={() => router.push('/admin/dashboard')}
                    >
                    Dashboard
                    </span>
                    <ChevronRight size={12} strokeWidth={3} className="shrink-0"/>
                    <span
                        className="custom-main-color-text-hover cursor-pointer whitespace-nowrap"
                        onClick={onBack}
                    >
                        Products
                    </span>
                    <ChevronRight size={12} strokeWidth={3} className="shrink-0"/>
                    <span className="text-[var(--header-text)] whitespace-nowrap">
                    Products Details
                </span>
                </nav>

                {/* Navigation Tabs */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <div
                        className="flex items-center card-theme p-1.5 rounded-full shadow-sm border border-gray-100 overflow-x-auto no-scrollbar max-w-full">
                        <div className="flex items-center min-w-max">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                                    activeTab === 'info'
                                        ? 'custom-main-color-bg text-black shadow-md'
                                        : 'text-gray-400 custom-main-color-text-hover'
                                }`}
                            >
                                <Info size={18}/> Information
                            </button>

                            <button
                                onClick={() => setActiveTab('images')}
                                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                                    activeTab === 'images'
                                        ? 'custom-main-color-bg text-black shadow-md'
                                        : 'text-gray-400 custom-main-color-text-hover'
                                }`}
                            >
                                <ImageIcon size={18}/>
                                Images
                                {allVariantImages.length > 0 && (
                                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                                        activeTab === 'images'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-[#0095A9]/10 text-[#0095A9]'
                                    }`}>
                                    {allVariantImages.length}
                                  </span>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab('variation')}
                                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                                    activeTab === 'variation'
                                        ? 'custom-main-color-bg text-black shadow-md'
                                        : 'text-gray-400 custom-main-color-text-hover'
                                }`}
                            >
                                <Layers size={18}/> Variation
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="card-theme rounded-[30px] md:rounded-[50px] p-6 md:p-10 lg:p-14 shadow-sm border border-gray-50">

                    {/* ── INFORMATION TAB ── */}
                    {activeTab === 'info' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

                                {/* Left: Product Preview */}
                                <div className="lg:col-span-5">
                                    <div className="lg:sticky lg:top-8 space-y-6">
                                        <h2 className="text-lg md:text-xl font-black text-[var(--header-text)] tracking-tight">
                                            Product Images
                                        </h2>
                                        <div
                                            className="aspect-square bg-[#F8FAFB] rounded-[30px] sm:rounded-[40px] border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden w-full max-w-sm mx-auto">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.productName}
                                                    className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 sm:gap-3">
                                                    <LuBox className="w-12 h-12 sm:w-16 sm:h-16 text-gray-200"/>
                                                    <span
                                                        className="text-[12px] font-black text-gray-300 uppercase tracking-widest">
                                                        No Image
                                                      </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Details */}
                                <div className="lg:col-span-7 space-y-10 sm:space-y-12">

                                    {/* General Information */}
                                    <section>
                                        <h2 className="text-lg md:text-xl font-black text-[var(--header-text)] mb-6 md:mb-8 tracking-tight">
                                            General Information
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

                                            <div className="md:col-span-2">
                                                <p className="text-[12px] uppercase tracking-[0.25em] font-black text-gray-400 mb-1 sm:mb-2">
                                                    Product Name
                                                </p>
                                                <p className="text-xl md:text-3xl font-black text-[var(--header-text)] leading-tight">
                                                    {product.productName}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[12px] uppercase tracking-[0.25em] font-black text-gray-400 mb-1 sm:mb-2">
                                                    Category
                                                </p>
                                                <span
                                                    className="inline-block px-4 py-2 card-theme text-gray-400 rounded-full text-[12px] font-black border border-slate-100 uppercase">
                                                    {product.category?.name || 'General'}
                                                </span>
                                            </div>

                                            <div>
                                                <p className="text-[12px] uppercase tracking-[0.25em] font-black text-gray-400 mb-1 sm:mb-2">
                                                    Brand
                                                </p>
                                                <span
                                                    className="inline-block px-4 py-2 card-theme text-gray-400 rounded-full text-[12px] font-black  uppercase">
                                                    {product.brand?.name || 'Generic'}
                                                </span>
                                            </div>

                                            <div className="md:col-span-2">
                                                <p className="text-[12px] uppercase tracking-[0.25em] font-black text-gray-400 mb-1 sm:mb-2">
                                                    Description
                                                </p>
                                                <div
                                                    className="text-sm md:text-base text-gray-500 leading-relaxed font-medium bg-gray-50/50 p-4 sm:p-6 rounded-[20px] sm:rounded-[30px] border border-gray-50">
                                                    {product.description || 'No description provided.'}
                                                </div>
                                            </div>

                                            <div className="md:col-span-2">
                                                <p className="text-[12px] uppercase tracking-[0.25em] font-black text-gray-400 mb-1 sm:mb-2">
                                                    Quick Tags
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {product.slug?.split('-').map((tag: string) => (
                                                        <span
                                                            key={tag}
                                                            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 card-theme rounded-full text-[11px] font-black text-gray-400"
                                                        >
                                                            <Tag className="w-3 h-3 text-[#0095A9]"/>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <hr className="border-gray-100"/>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                        <section>
                                            <h2 className="text-lg font-black text-[var(--header-text)] mb-4 sm:mb-6">
                                                Pricing
                                            </h2>
                                            <div className="space-y-3 sm:space-y-4">
                                                <div>
                                                    <p className="text-[12px] uppercase font-black text-slate-400 mb-1">
                                                        Regular Price
                                                    </p>
                                                    <p className="text-xl sm:text-2xl font-black text-[var(--header-text)]">
                                                        ${Number(product.price || 0).toFixed(2)}
                                                    </p>
                                                </div>
                                                {product.discount_price &&
                                                    Number(product.discount_price) > 0 && (
                                                        <div>
                                                            <p className="text-[10px] uppercase font-black text-slate-300 mb-1">
                                                                Discount Price
                                                            </p>
                                                            <p className="text-xl sm:text-2xl font-black text-emerald-500">
                                                                ${Number(product.discount_price).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    )}
                                            </div>
                                        </section>

                                        <section>
                                            <h2 className="text-lg font-black text-[var(--header-text)] mb-4 sm:mb-6">
                                                Inventory
                                            </h2>
                                            <div className="space-y-3 sm:space-y-4">
                                                <div>
                                                    <p className="text-[12px] uppercase font-black text-slate-400 mb-1">
                                                        Stock Status
                                                    </p>
                                                    <span
                                                        className="inline-block px-3 py-1.5 sm:px-4 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-black border border-emerald-100">
                                                        {totalStock} Units Available
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-[12px] uppercase font-black text-slate-400 mb-1">
                                                        slug
                                                    </p>
                                                    <p className="text-xs font-black text-gray-400 break-all uppercase">
                                                        {product.slug || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── IMAGES TAB ── */}
                    {activeTab === 'images' && (
                        <div className="space-y-10 animate-in fade-in duration-300">
                            <section>
                                <h2 className="text-lg font-black text-[var(--header-text)] mb-6">Main Image</h2>
                                <div
                                    className="w-32 h-32 bg-[#F8FAFB] rounded-[30px] border-2 border-dashed border-gray-100 overflow-hidden flex items-center justify-center">
                                    {product.image ? (
                                        <img src={product.image} className="w-full h-full object-contain" alt="Main"/>
                                    ) : (
                                        <LuBox size={40} className="text-gray-200"/>
                                    )}
                                </div>
                            </section>

                            {mergedVariants.filter(v => v.images?.length).map((variant, i) => (
                                <section key={variant.id ?? i}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span
                                            className="px-3 py-1 card-theme text-gray-400 rounded-full text-[11px] font-black border border-[#CCF0F3] uppercase">
                                            {variant.size}
                                        </span>
                                        <span className="w-4 h-4 rounded-full border border-gray-200"
                                              style={{background: variant.color?.toLowerCase()}}/>
                                        <span
                                            className="text-xs font-black text-gray-400">{variant.color}</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                                        {variant.images?.map((img: any) => (
                                            <div key={img.id}
                                                 className={`relative aspect-square bg-[#F8FAFB] rounded-[24px] overflow-hidden border-2 ${img.is_primary ? 'border-[#0095A9]' : 'border-gray-100'}`}>
                                                <img src={img.image} className="w-full h-full object-contain"
                                                     alt="variant"/>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}

                    {/* ── VARIATION TAB ── */}
                    {activeTab === 'variation' && (
                        <div className="animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {mergedVariants.map((v, i) => {
                                    const isDeletingThis = deletingVariantId === v.id;
                                    return (
                                        <div key={v.id ?? i}
                                             className="p-5 card-theme rounded-[28px] border border-gray-100 flex flex-col justify-between gap-4">

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full border"
                                                              style={{background: v.color?.toLowerCase()}}/>
                                                        <p className="text-xs font-black text-gray-400 uppercase">{v.color}</p>
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-300 uppercase">Size: {v.size}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-gray-400">{v.stock}</p>
                                                    <p className="text-[9px] font-black text-gray-300 uppercase">Stock</p>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-gray-50 flex justify-end">
                                                <button
                                                    onClick={() => handleDeleteVariant(v.id)}
                                                    disabled={isDeletingThis}
                                                    aria-disabled={!canDelete}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                                        canDelete
                                                            ? 'bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer'
                                                            : 'bg-red-50/50 text-red-300 cursor-not-allowed'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    <Trash2 size={13} />
                                                    {isDeletingThis ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;