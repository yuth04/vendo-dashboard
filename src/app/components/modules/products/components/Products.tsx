'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Download, Plus, Search, SlidersHorizontal, ChevronDown,
    Eye, Pencil, ShieldCheck, Trash2, Loader2, ShieldAlert, ImageOff
} from 'lucide-react';

import { useProductData } from '@/src/app/components/modules/products/core/hook/useProductData';
import { Product, ProductListResponse, ProductVariant } from '@/src/app/components/modules/products/core/models/productModel';
import { productService } from '@/src/app/components/modules/products/core/services/productService';
import AddProduct from '@/src/app/components/modules/products/components/AddProducts';
import AddVariants from '@/src/app/components/modules/products/components/AddVariants';
import EditProduct from '@/src/app/components/modules/products/components/EditProducts';
import EditVariants from '@/src/app/components/modules/products/components/EditVariants';
import Pagination from "@/src/app/components/modules/products/components/Pagination";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { LuBox } from "react-icons/lu";

const Products = () => {
    const router = useRouter();
    const { showToast, showConfirm } = useAlert();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showVariantsModal, setShowVariantsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showEditVariantModal, setShowEditVariantModal] = useState(false);
    const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
    const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deletingVariantId, setDeletingVariantId] = useState<number | null>(null);
    const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);
    const [expandedProductIds, setExpandedProductIds] = useState<Set<number>>(new Set());
    const [variantImagesMap, setVariantImagesMap] = useState<Record<number, string | null>>({});
    const [variantDetailLoading, setVariantDetailLoading] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const itemsPerPage = 10;

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

    //-- Delete: super-admin + admin --//
    const canEditDelete = isSuperAdmin || isAdmin;

    //--- Activate : Deactivate status: super-admin & admin only --//
    const canChangeStatus = isSuperAdmin || isAdmin;

    const fetchFn = useCallback(() => productService.getProducts(), []);

    const { data, loading, error, refetchData } = useProductData<ProductListResponse>(
        fetchFn,
        { message: '', product: [] },
        true
    );

    const products: Product[] = data?.product ?? [];

    const refreshVariantImages = useCallback(() => {
        productService.getVariants().then((res) => {
            const allVariants: ProductVariant[] = res.data?.product_variant ?? [];
            const map: Record<number, string | null> = {};
            allVariants.forEach((v) => {
                const primary = v.images?.find(img => img.is_primary)?.image
                    ?? v.images?.[0]?.image
                    ?? null;
                map[v.id] = primary;
            });
            setVariantImagesMap(map);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        productService.getVariants(controller.signal).then((res) => {
            const allVariants: ProductVariant[] = res.data?.product_variant ?? [];
            const map: Record<number, string | null> = {};
            allVariants.forEach((v) => {
                const primary = v.images?.find(img => img.is_primary)?.image
                    ?? v.images?.[0]?.image
                    ?? null;
                map[v.id] = primary;
            });
            setVariantImagesMap(map);
        }).catch(() => {});
        return () => controller.abort();
    }, []);

    const handleSuccess = useCallback(() => {
        refetchData ? refetchData() : window.location.reload();
        refreshVariantImages();
    }, [refetchData, refreshVariantImages]);

    const categories = useMemo(
        () => productService.extractCategories(data ?? null),
        [data]
    );

    const filteredProducts = useMemo(
        () => productService.filterProducts(products, searchTerm, selectedCategory, selectedStatus),
        [products, searchTerm, selectedCategory, selectedStatus]
    );

    const totalPages = useMemo(
        () => productService.getTotalPages(filteredProducts.length, itemsPerPage),
        [filteredProducts.length]
    );

    const paginatedProducts = useMemo(
        () => productService.paginate(filteredProducts, currentPage, itemsPerPage),
        [filteredProducts, currentPage]
    );

    const handleViewDetail = (id: number) => {
        setDetailLoadingId(id);
        router.push(`/admin/products/${id}`);
    };

    const toggleExpand = (productId: number) => {
        setExpandedProductIds(prev => {
            const next = new Set(prev);
            next.has(productId) ? next.delete(productId) : next.add(productId);
            return next;
        });
    };

    const handleEditClick = (product: Product) => {
        if (!canEditDelete) {
            showToast("Only super-admin and admin can edit products.", "error");
            return;
        }
        setEditingProduct(product);
        setShowEditModal(true);
    };

    const handleEditVariant = async (variant: ProductVariant) => {
        if (!canEditDelete) {
            showToast("Only super-admin and admin can edit variants.", "error");
            return;
        }
        setVariantDetailLoading(variant.id);
        try {
            const res = await productService.getVariantById(variant.id);
            setEditingVariant(res.data?.product_variant ?? variant);
            setShowEditVariantModal(true);
        } catch {
            setEditingVariant(variant);
            setShowEditVariantModal(true);
        } finally {
            setVariantDetailLoading(null);
        }
    };

    const handleDeleteVariant = async (variantId: number, variantLabel: string) => {
        if (!canEditDelete) {
            showToast("Only super-admin and admin can delete variants.", "error");
            return;
        }
        const confirmed = await showConfirm({
            title: "Delete Variant",
            message: `Are you sure you want to delete variant "${variantLabel}"? This action cannot be undone.`,
            confirmLabel: "Delete",
            cancelLabel: "Cancel",
            variant: "danger"
        });
        if (!confirmed) return;
        try {
            setDeletingVariantId(variantId);
            await productService.deleteVariant(variantId);
            showToast(`Variant "${variantLabel}" deleted successfully.`, "success");
            handleSuccess();
        } catch {
            showToast("Failed to delete variant. Please try again.", "error");
        } finally {
            setDeletingVariantId(null);
        }
    };

    const handleToggleStatus = async (product: Product) => {
        if (!canChangeStatus) {
            showToast("Only super-admin can activate or deactivate products.", "error");
            return;
        }
        const isProductActive = (product.status || 'active').toLowerCase() === 'active';
        const newStatus = isProductActive ? 'inactive' : 'active';
        const confirmed = await showConfirm({
            title: isProductActive ? "Deactivate Product" : "Activate Product",
            message: `Are you sure you want to ${isProductActive ? 'deactivate' : 'activate'} "${product.productName}"?`,
            confirmLabel: isProductActive ? "Deactivate" : "Activate",
            variant: isProductActive ? "danger" : "info"
        });
        if (!confirmed) return;
        setStatusLoadingId(product.id);
        try {
            const formData = new FormData();
            formData.append('productName', product.productName || '');
            formData.append('status', newStatus);
            if (product.price) formData.append('price', String(product.price));
            if (product.category?.id) formData.append('category_id', String(product.category.id));
            if (product.brand?.id) formData.append('brand_id', String(product.brand.id));
            if (product.description) formData.append('description', product.description);
            await productService.updateProduct(product.id, formData);
            showToast(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, "success");
            refetchData();
        } catch (err: any) {
            showToast(err?.response?.data?.message || "Failed to update status.", "error");
        } finally {
            setStatusLoadingId(null);
        }
    };

    const handleDeleteProduct = async (id: number, productName: string) => {
        if (!canEditDelete) {
            showToast("Only super-admin and admin can delete products.", "error");
            return;
        }
        const confirmed = await showConfirm({
            title: "Delete Product",
            message: `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
            confirmLabel: "Delete",
            cancelLabel: "Cancel",
            variant: "danger"
        });
        if (!confirmed) return;
        try {
            setDeletingId(id);
            await productService.deleteProduct(id);
            showToast(`Product "${productName}" was deleted successfully.`, "success");
            handleSuccess();
        } catch {
            showToast("Failed to delete product. Please try again.", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const handleExport = (type: 'excel' | 'pdf') =>
        productService.exportProducts({
            type,
            onSuccess: (msg) => showToast(msg, "success"),
            onError: (msg) => showToast(msg, "error"),
        });

    return (
        <div className="min-h-screen sm:p-6 py-4 md:p-8 relative">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* --- Header --- */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-10 h-10 sm:w-12 sm:h-12 custom-main-color-card rounded-full flex items-center justify-center custom-main-color-icon shrink-0">
                            <LuBox className="h-5 w-5 custom-main-color-icon"/>
                        </div>
                        <div>
                            <h1 className="text-[20px] md:text-[26px] font-bold text-[var(--header-text)]">Products
                                Management</h1>
                            <p className="text-gray-500 text-[11px] md:text-sm mt-0.5">Manage your inventory, prices,
                                and product details.</p>
                        </div>
                    </div>

                    {/* Buttons Section - Optimized for Mobile */}
                    <div className="flex flex-col w-full sm:flex-row sm:w-auto items-center gap-2">

                        <div className="flex w-full sm:w-auto gap-2">
                            <button onClick={() => handleExport('excel')}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-[15px] bg-[#00b67a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#00a06b] transition-colors shadow-sm cursor-pointer">
                                <Download className="h-3.5 w-3.5"/>Export Excel
                            </button>
                            <button onClick={() => handleExport('pdf')}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-[15px] card-theme px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                                <Download className="h-3.5 w-3.5"/>Export PDF
                            </button>
                        </div>

                        <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1"/>

                        <div className="flex w-full sm:w-auto gap-2">
                            <button onClick={() => setShowAddModal(true)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-[15px] bg-[#8cb3b1] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#7ba2a0] transition-colors shadow-sm cursor-pointer">
                                <Plus className="h-3.5 w-3.5"/> Add Product
                            </button>
                            <button onClick={() => setShowVariantsModal(true)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-[15px] bg-[#8cb3b1] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#7ba2a0] transition-colors shadow-sm cursor-pointer">
                                <Plus className="h-3.5 w-3.5"/> Add Variants
                            </button>
                        </div>
                    </div>
                </div>

                <AddProduct isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={handleSuccess}/>
                <AddVariants isOpen={showVariantsModal} onClose={() => setShowVariantsModal(false)}
                             onSuccess={handleSuccess}/>
                <EditProduct
                    isOpen={showEditModal}
                    product={editingProduct}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingProduct(null);
                    }}
                    onSuccess={handleSuccess}
                />
                <EditVariants
                    isOpen={showEditVariantModal}
                    variant={editingVariant}
                    onClose={() => {
                        setShowEditVariantModal(false);
                        setEditingVariant(null);
                    }}
                    onSuccess={handleSuccess}
                />

                {/* --- Filters --- */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                    <div className="relative md:col-span-8">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search products by name..."
                            className="w-full rounded-[20px] input-theme py-4 pl-11 pr-4 text-sm text-gray-700 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-gray-400 shadow-sm"
                        />
                    </div>
                    <div className="relative md:col-span-2">
                        <SlidersHorizontal className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full appearance-none rounded-[20px] card-theme py-4 pl-11 pr-10 text-sm text-gray-500 outline-none cursor-pointer shadow-sm"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                            ))}
                        </select>
                        <ChevronDown
                            className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-gray-400"/>
                    </div>
                    <div className="relative md:col-span-2">
                        <SlidersHorizontal className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full appearance-none rounded-[20px] card-theme py-4 pl-11 pr-10 text-sm text-gray-500 outline-none cursor-pointer shadow-sm"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <ChevronDown
                            className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-gray-400"/>
                    </div>
                </div>

                {/* --- Table --- */}
                <div className="overflow-hidden rounded-2xl card-theme shadow-sm relative">
                    {detailLoadingId !== null && (
                        <div className="absolute inset-0 z-[20] flex items-center justify-center">
                            <Loader2 className="animate-spin custom-main-color-icon" size={32}/>
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead className="bg-gray-50/50">
                            <tr className="border-b border-gray-100/50 text-[14px] text-[var(--header-text)]">
                                <th className="w-10 px-4 py-4"></th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Prices</th>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400">
                                        <div className="absolute inset-0 z-[20] flex items-center justify-center">
                                            <Loader2 className="animate-spin custom-main-color-icon" size={32}/>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {error && !loading && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-red-400">
                                        {error.message}
                                    </td>
                                </tr>
                            )}
                            {!loading && !error && paginatedProducts.length === 0 && (
                                <tr>
                                    <td colSpan={8}>
                                        <div
                                            className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                                            <LuBox className="w-12 h-12 text-gray-300"/>
                                            <span> No products found.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!loading && paginatedProducts.map((product, idx) => {
                                const totalStock = productService.getTotalStock(product);
                                const price = parseFloat(product.price);
                                const productKey = product.id || `prod-new-${idx}`;
                                const isDeleting = deletingId === product.id;
                                const isProductActive = (product.status || 'active').toLowerCase() === 'active';
                                const isExpanded = expandedProductIds.has(product.id);
                                const hasVariants = (product.variants?.length ?? 0) > 0;

                                const isRowBusy = isDeleting || statusLoadingId === product.id;

                                const editLooksDisabled = !canEditDelete;
                                const deleteLooksDisabled = !canEditDelete;
                                const statusLooksDisabled = !canChangeStatus;

                                return (
                                    <React.Fragment key={productKey}>
                                        <tr
                                            className={`group border-b border-gray-50/50 transition-colors ${hasVariants ? 'cursor-pointer hover:bg-gray-50/70' : 'hover:bg-gray-50/40'} ${isExpanded ? 'bg-gray-50/60' : ''}`}
                                            onClick={() => hasVariants && toggleExpand(product.id)}
                                        >
                                            <td className="w-10 px-4 py-4">
                                                {hasVariants ? (
                                                    <div
                                                        className={`flex h-8 w-8 items-center justify-center rounded-full card-theme shadow-sm transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                                                        <ChevronDown className="h-3.5 w-3.5 text-gray-400"/>
                                                    </div>
                                                ) : (
                                                    <div className="h-6 w-6"/>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shadow-inner shrink-0">
                                                        {product.image
                                                            ? <img src={product.image} alt={product.productName}
                                                                   className="h-full w-full object-contain"/>
                                                            : <span className="text-lg">📦</span>
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[14px] text-[var(--header-text)]">{product.productName}</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--header-text)]0 mt-0.5">{product.brand?.name ?? '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-500 ring-1 ring-blue-100">
                                                    ${isNaN(price) ? '—' : price.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-500 ring-1 ring-blue-100">
                                                    Product ID {product.id}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-[14px] text-[var(--header-text)] font-bold">
                                                {product.category?.name ?? '—'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className={`text-xl font-black ${totalStock === 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {totalStock}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-wide ring-1 ${isProductActive ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' : 'bg-gray-50 text-gray-500 ring-gray-200'}`}>
                                                    {isProductActive ? 'IN STOCK' : 'INACTIVE'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right"
                                                onClick={e => e.stopPropagation()}>
                                                <div
                                                    className="flex items-center justify-end gap-2 text-gray-400 md:opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                                                    <button disabled={isRowBusy}
                                                            className="p-2 rounded-full hover:bg-emerald-50 text-gray-500 hover:text-emerald-500 transition-all disabled:opacity-50 cursor-pointer"
                                                            onClick={() => handleViewDetail(product.id)}>
                                                        <Eye className="h-4 w-4"/>
                                                    </button>

                                                    <button disabled={isRowBusy}
                                                            title="Edit"
                                                            className={`p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                editLooksDisabled
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 cursor-pointer'
                                                            }`}
                                                            onClick={() => handleEditClick(product)}>
                                                        <Pencil className="h-4 w-4"/>
                                                    </button>

                                                    <button onClick={() => handleToggleStatus(product)}
                                                            disabled={isRowBusy}
                                                            title={isProductActive ? "Deactivate" : "Activate"}
                                                            className={`rounded-full p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                statusLooksDisabled
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : isProductActive
                                                                        ? 'text-orange-400 hover:text-orange-600 hover:bg-orange-50 cursor-pointer'
                                                                        : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer'
                                                            }`}>
                                                        {statusLoadingId === product.id
                                                            ? <Loader2 size={16} className="animate-spin"/>
                                                            : isProductActive ? <ShieldCheck size={16}/> :
                                                                <ShieldAlert size={16}/>
                                                        }
                                                    </button>

                                                    <button disabled={isRowBusy}
                                                            title="Delete"
                                                            onClick={() => handleDeleteProduct(product.id, product.productName)}
                                                            className={`p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                deleteLooksDisabled
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'text-gray-500 hover:bg-red-50 hover:text-red-500 cursor-pointer'
                                                            }`}>
                                                        {isDeleting
                                                            ? <Loader2 className="h-4 w-4 animate-spin text-red-500"/>
                                                            : <Trash2 className="h-4 w-4"/>
                                                        }
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* ── Variant Rows ── */}
                                        {isExpanded && hasVariants && product.variants!.map((variant, vIdx) => {
                                            const variantImage = variantImagesMap[variant.id] ?? null;
                                            const isLowStock = variant.stock > 0 && variant.stock <= 5;
                                            const isOutOfStock = variant.stock === 0;
                                            const isDeletingVariant = deletingVariantId === variant.id;
                                            const isLoadingVariantDetail = variantDetailLoading === variant.id;
                                            const variantLabel = `${variant.color} / ${variant.size}`;
                                            const isVariantRowBusy = isDeletingVariant || isLoadingVariantDetail;
                                            const variantActionLooksDisabled = !canEditDelete;

                                            return (
                                                <tr key={variant.id ?? `v-${vIdx}`} className="border-b card-theme">
                                                    <td className="w-10 px-4 py-3"/>
                                                    <td className="whitespace-nowrap px-6 py-3">
                                                        <div className="flex items-center gap-3 pl-4">
                                                            <div
                                                                className="flex h-8 w-8 items-center justify-center rounded-md card-theme overflow-hidden shadow-sm shrink-0">
                                                                {variantImage
                                                                    ? <img src={variantImage} alt={variant.color}
                                                                           className="h-full w-full object-contain"/>
                                                                    : <ImageOff className="h-3.5 w-3.5 text-gray-300"/>
                                                                }
                                                            </div>
                                                            <p className="text-xs text-gray-500">
                                                                <span
                                                                    className="font-semibold text-gray-400">Color:</span>{' '}
                                                                <span
                                                                    className="font-bold text-blue-500">{variant.color}</span>
                                                                {', '}
                                                                <span
                                                                    className="font-semibold text-gray-400">Size:</span>{' '}
                                                                <span
                                                                    className="font-bold text-blue-500">{variant.size}</span>
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-3">
                                                        <span className="text-xs text-gray-300 font-medium">---</span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-3">
                                                        <span
                                                            className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-400 ring-1 ring-orange-100">
                                                            variant ID {variant.id}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-3">
                                                        <span className="text-xs text-gray-300 font-medium">---</span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-3">
                                                        <span
                                                            className={`text-base font-black ${isOutOfStock ? 'text-red-500' : 'text-emerald-500'}`}>
                                                            {variant.stock}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-3">
                                                        {isOutOfStock ? (
                                                            <span
                                                                className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold tracking-wide text-red-500 ring-1 ring-red-200">OUT OF STOCK</span>
                                                        ) : isLowStock ? (
                                                            <span
                                                                className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold tracking-wide text-orange-500 ring-1 ring-orange-200">LOW STOCK</span>
                                                        ) : (
                                                            <span
                                                                className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold tracking-wide text-emerald-600 ring-1 ring-emerald-200">IN STOCK</span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-3 text-right">
                                                        <div
                                                            className="flex items-center justify-end gap-4 text-gray-300">
                                                            <button
                                                                disabled={isVariantRowBusy}
                                                                title="Edit"
                                                                onClick={() => handleEditVariant(variant)}
                                                                className={`transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                    variantActionLooksDisabled
                                                                        ? 'text-gray-300 cursor-not-allowed'
                                                                        : 'hover:text-amber-500 cursor-pointer'
                                                                }`}>
                                                                {isLoadingVariantDetail
                                                                    ? <Loader2
                                                                        className="h-3.5 w-3.5 animate-spin text-amber-400"/>
                                                                    : <Pencil className="h-3.5 w-3.5"/>
                                                                }
                                                            </button>
                                                            <button
                                                                disabled={isVariantRowBusy}
                                                                title="Delete"
                                                                onClick={() => handleDeleteVariant(variant.id, variantLabel)}
                                                                className={`transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                    variantActionLooksDisabled
                                                                        ? 'text-gray-300 cursor-not-allowed'
                                                                        : 'hover:text-red-500 cursor-pointer'
                                                                }`}>
                                                                {isDeletingVariant
                                                                    ? <Loader2
                                                                        className="h-3.5 w-3.5 animate-spin text-red-400"/>
                                                                    : <Trash2 className="h-3.5 w-3.5"/>
                                                                }
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    {/* --- Pagination --- */}
                    <div
                        className="flex flex-col sm:flex-row justify-between items-center py-8 px-6 gap-4 border-t border-gray-50/50">
                        <p className="text-sm text-gray-500 font-medium">
                            Showing {paginatedProducts.length} of {filteredProducts.length} Products
                        </p>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Products;