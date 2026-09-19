'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Plus, X, ImagePlus, Trash2 } from 'lucide-react';
import { productService } from '@/src/app/components/modules/products/core/services/productService';
import { Product } from '@/src/app/components/modules/products/core/models/productModel';
import { useAlert } from "@/src/app/components/context/AlertContext";
import {
    COLOR_HEX_MAP,
    COLOR_OPTIONS,
    makeVariant,
    SIZE_OPTIONS,
    VariantForm
} from "@/src/app/components/constant/components/products/variantConstants";


interface AddVariantsProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddVariants = ({ isOpen, onClose, onSuccess }: AddVariantsProps) => {
    const { showToast } = useAlert();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [variants, setVariants] = useState<VariantForm[]>([makeVariant()]);
    const [submitting, setSubmitting] = useState(false);

    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    useEffect(() => {
        if (!isOpen) return;
        setLoadingProducts(true);
        productService.getProducts()
            .then(res => setProducts(res.data?.product ?? []))
            .finally(() => setLoadingProducts(false));
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setVariants([makeVariant()]);
            setSelectedProductId('');
        }
    }, [isOpen]);

    const updateVariant = (id: string, patch: Partial<VariantForm>) => {
        setVariants(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v));
    };

    const addVariant = () => setVariants(prev => [...prev, makeVariant()]);

    const removeVariant = (id: string) => {
        setVariants(prev => prev.length > 1 ? prev.filter(v => v.id !== id) : prev);
    };

    const handleImageFile = (variantId: string, file: File) => {
        setVariants(prev => prev.map(v => {
            if (v.id !== variantId) return v;
            // Limit to 4 images max
            if (v.images.length >= 4) return v;
            return {
                ...v,
                images: [...v.images, { file, preview: URL.createObjectURL(file) }],
            };
        }));
    };

    const removeImage = (variantId: string, imgIndex: number) => {
        setVariants(prev => prev.map(v => {
            if (v.id !== variantId) return v;
            const next = [...v.images];
            URL.revokeObjectURL(next[imgIndex].preview);
            next.splice(imgIndex, 1);
            return { ...v, images: next };
        }));
    };

    const handleSubmit = async () => {
        if (!selectedProductId) return showToast('Please select a product.', 'warning');

        // 1. Basic validation loop
        for (const v of variants) {
            if (!v.size) return showToast('Please select a size for all variants.', 'warning');
            if (!v.color) return showToast('Please select a color for all variants.', 'warning');
            if (isNaN(parseInt(v.stock)) || parseInt(v.stock) < 0)
                return showToast('Please enter a valid stock for all variants.', 'warning');
        }

        // 2. Check for duplicates within the newly created local batch form items
        const localSeen = new Set<string>();
        for (const v of variants) {
            const comboKey = `${v.size.toLowerCase()}_${v.color.toLowerCase()}`;
            if (localSeen.has(comboKey)) {
                return showToast(`You have duplicated the combination Size "${v.size}" and Color "${v.color}" multiple times in this form batch.`, 'warning');
            }
            localSeen.add(comboKey);
        }

        // 3. Cross check configuration matches with database data already saved
        const currentProduct = products.find(p => String(p.id) === selectedProductId);
        if (currentProduct && currentProduct.variants) {
            for (const v of variants) {
                const isDuplicate = currentProduct.variants.some(existing =>
                    existing.size?.toLowerCase() === v.size.toLowerCase() &&
                    existing.color?.toLowerCase() === v.color.toLowerCase()
                );

                if (isDuplicate) {
                    return showToast(`Variant with Size "${v.size}" and Color "${v.color}" is already available for this product.`, 'warning');
                }
            }
        }

        setSubmitting(true);
        let failed = 0;

        for (const v of variants) {
            const formData = new FormData();
            formData.append('product_id', selectedProductId);
            formData.append('size', v.size);
            formData.append('color', v.color);
            formData.append('stock', v.stock);
            formData.append('status', v.status);
            v.images.forEach(img => formData.append('images[]', img.file));

            try {
                const res = await productService.createVariant(formData);
                if (res.error) failed++;
            } catch {
                failed++;
            }
        }

        setSubmitting(false);
        if (failed > 0) {
            showToast(`${failed} variant(s) failed to create. Please try again.`, 'error');
        } else {
            showToast('All variants created successfully!', 'success');
            onSuccess();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="card-theme rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

                <div className="flex items-start justify-between px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                            <Plus className="h-4 w-4 custom-main-color-text" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--header-text)]">Add Product Variants</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Add size, color, stock and images per variant</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
                    <div className="space-y-1.5">
                        <div>
                            <label className="text-[14px] font-semibold text-gray-500">Select Product <span
                                className="text-red-400">*</span></label>
                        </div>
                        <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} disabled={loadingProducts} className="w-full rounded-2xl input-theme px-4 py-3 text-sm text-gray-600 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 cursor-pointer transition-all disabled:opacity-50">
                            <option value=""> Choose a product </option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-emerald-500">Variants <span className="text-emerald-400">({variants.length})</span></p>
                        <button type="button" onClick={addVariant} className="flex items-center gap-1.5 rounded-full card-theme px-4 py-2 text-xs font-bold text-gray-500 cursor-pointer">
                            <Plus className="h-3.5 w-3.5" /> Add Variant
                        </button>
                    </div>

                    <div className="space-y-4">
                        {variants.map((variant) => (
                            <div key={variant.id} className="rounded-2xl card-theme p-4 sm:p-5 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <div>
                                            <label className="text-[14px] font-bold text-gray-400">Size</label>
                                        </div>
                                        <select value={variant.size} onChange={e => updateVariant(variant.id, { size: e.target.value })} className="w-full rounded-xl input-theme px-3 py-3 text-sm text-gray-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 cursor-pointer transition-all">
                                            <option value="">Select</option>
                                            {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-[14px] font-bold text-gray-400">Color</label>
                                            </div>
                                            {variant.color && (
                                                <div className="h-3 w-3 rounded-full border border-gray-200" style={{backgroundColor: COLOR_HEX_MAP[variant.color] || '#ccc'}} />
                                            )}
                                        </div>
                                        <select value={variant.color} onChange={e => updateVariant(variant.id, {color: e.target.value})} className="w-full rounded-xl input-theme px-3 py-3 text-sm text-gray-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 cursor-pointer transition-all">
                                            <option value="">Select</option>
                                            {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1 space-y-1.5">
                                            <div>
                                                <label className="text-[14px] font-bold text-gray-400">Stock</label>
                                            </div>
                                            <input type="number" min="0" value={variant.stock} onChange={e => updateVariant(variant.id, {stock: e.target.value})} className="w-full rounded-xl input-theme px-3 py-3 text-sm text-gray-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"/>
                                        </div>
                                        {variants.length > 1 && (
                                            <button type="button" onClick={() => removeVariant(variant.id)} className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors cursor-pointer">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 w-full sm:w-48">
                                    <button type="button" onClick={() => updateVariant(variant.id, { status: 'active' })} className={`rounded-xl border py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${variant.status === 'active' ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'}`}>Active</button>
                                    <button type="button" onClick={() => updateVariant(variant.id, { status: 'inactive' })} className={`rounded-xl border py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${variant.status === 'inactive' ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50'}`}>Inactive</button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[14px] font-bold text-gray-400">Images ({variant.images.length}/4)</label>
                                        {variant.images.length < 4 && (
                                            <button type="button" onClick={() => fileInputRefs.current[variant.id]?.click()} className="flex items-center gap-1 text-[14px] font-bold uppercase tracking-wider text-emerald-500 hover:text-emerald-600 transition-colors">
                                                <ImagePlus className="h-3.5 w-3.5" /> Add
                                            </button>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg"
                                            multiple
                                            className="hidden"
                                            ref={el => { fileInputRefs.current[variant.id] = el; }}
                                            onChange={e => {
                                                const files = e.target.files;
                                                if (files) {
                                                    Array.from(files).forEach(file => handleImageFile(variant.id, file));
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {Array.from({ length: 4 }).map((_, imgIdx) => {
                                            const img = variant.images[imgIdx];
                                            return (
                                                <div key={imgIdx} onClick={() => { if (!img) fileInputRefs.current[variant.id]?.click(); }} className={`relative aspect-square rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${img ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 bg-white cursor-pointer custom-main-color-border-hover hover:bg-emerald-50/20'}`}>
                                                    {img ? (
                                                        <>
                                                            <img src={img.preview} alt="v-img" className="h-full w-full object-cover rounded-xl" />
                                                            <button type="button" onClick={e => { e.stopPropagation(); removeImage(variant.id, imgIdx); }} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow text-gray-400 hover:text-red-400 transition-colors">
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <ImagePlus className="h-5 w-5 text-gray-200" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 sm:px-8 py-5 shrink-0">
                    <button type="button" onClick={onClose} disabled={submitting} className="rounded-full card-theme px-6 py-2.5 text-sm font-medium text-gray-500 cursor-pointer">Cancel</button>
                    <button type="button" onClick={handleSubmit} disabled={submitting} className="rounded-full custom-main-color-button px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#7ba2a0] transition-colors disabled:opacity-60 cursor-pointer shadow-sm">
                        {submitting ? 'Creating...' : `Create ${variants.length} Variant${variants.length > 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddVariants;