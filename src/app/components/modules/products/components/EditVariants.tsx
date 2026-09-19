'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, ImagePlus, Pencil } from 'lucide-react';
import { productService } from '@/src/app/components/modules/products/core/services/productService';
import { Product, ProductVariant } from '@/src/app/components/modules/products/core/models/productModel';
import { useAlert } from "@/src/app/components/context/AlertContext";
import {
    COLOR_HEX_MAP,
    COLOR_OPTIONS,
    SIZE_OPTIONS
} from "@/src/app/components/constant/components/products/variantConstants";

interface EditVariantsProps {
    isOpen: boolean;
    variant: ProductVariant | null;
    onClose: () => void;
    onSuccess: () => void;
}

interface VariantImage {
    id?: number;
    file?: File;
    preview: string;
    is_primary?: boolean;
    existing?: boolean;
}

const EditVariants = ({ isOpen, variant, onClose, onSuccess }: EditVariantsProps) => {
    const { showToast } = useAlert();
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string>('');

    const [size, setSize] = useState('');
    const [color, setColor] = useState('');
    const [stock, setStock] = useState('0');
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [images, setImages] = useState<VariantImage[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setLoadingProducts(true);
        productService.getProducts()
            .then(res => setProducts(res.data?.product ?? []))
            .finally(() => setLoadingProducts(false));
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !variant) return;
        setSelectedProductId(String(variant.product_id ?? ''));
        setSize(variant.size ?? '');
        setColor(variant.color ?? '');
        setStock(String(variant.stock ?? 0));
        setStatus((variant.status as 'active' | 'inactive') ?? 'active');
        setImages(
            (variant.images ?? []).map(img => ({
                id: img.id,
                preview: img.image,
                is_primary: img.is_primary,
                existing: true,
            }))
        );
    }, [isOpen, variant]);

    useEffect(() => {
        if (!isOpen) {
            setProducts([]);
            setSelectedProductId('');
            setSize('');
            setColor('');
            setStock('0');
            setStatus('active');
            setImages([]);
        }
    }, [isOpen]);

    // Updated to handle multiple files
    const handleFilesSelected = (files: FileList | null) => {
        if (!files) return;
        const fileArray = Array.from(files);

        // Calculate how many more we can add
        const slotsRemaining = 4 - images.length;
        const filesToAdd = fileArray.slice(0, slotsRemaining);

        const newImages = filesToAdd.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            existing: false
        }));

        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (idx: number) => {
        setImages(prev => {
            const next = [...prev];
            if (!next[idx].existing) URL.revokeObjectURL(next[idx].preview);
            next.splice(idx, 1);
            return next;
        });
    };

    const handleSubmit = async () => {
        if (!variant) return;
        if (!selectedProductId) return showToast('Please select a product.', 'warning');
        if (!size) return showToast('Please select a size.', 'warning');
        if (!color) return showToast('Please select a color.', 'warning');
        if (isNaN(parseInt(stock)) || parseInt(stock) < 0)
            return showToast('Please enter a valid stock.', 'warning');

        // Check if the variant configuration already exists on the selected product
        const currentProduct = products.find(p => String(p.id) === selectedProductId);
        if (currentProduct && currentProduct.variants) {
            const isDuplicate = currentProduct.variants.some(v =>
                String(v.id) !== String(variant.id) &&
                v.size?.toLowerCase() === size.toLowerCase() &&
                v.color?.toLowerCase() === color.toLowerCase()
            );

            if (isDuplicate) {
                return showToast(`Variant with Size "${size}" and Color "${color}" is already available.`, 'warning');
            }
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('product_id', selectedProductId);
            formData.append('size', size);
            formData.append('color', color);
            formData.append('stock', stock);
            formData.append('status', status);

            images.forEach(img => {
                if (!img.existing && img.file) {
                    formData.append('images[]', img.file);
                }
            });

            const res = await productService.updateVariant(variant.id, formData);

            if (res.error) {
                const errorMessage = typeof res.error === 'string' ? res.error : JSON.stringify(res.error);
                throw new Error(errorMessage);
            }

            showToast('Variant updated successfully!', 'success');
            onSuccess();
            onClose();
        } catch (err: any) {
            showToast(err?.response?.data?.message || err?.message || 'Failed to update variant.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !variant) return null;

    return (
        <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="card-theme rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-start justify-between px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                            <Pencil className="h-4 w-4 custom-main-color-text" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--header-text)]">Edit Variant</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Variant ID {variant.id} · {variant.color} / {variant.size}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[14px] font-semibold text-gray-500">Product <span className="text-red-400">*</span></label>
                        <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} disabled={loadingProducts}
                                className="w-full rounded-2xl input-theme px-4 py-3 text-sm text-gray-600 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 cursor-pointer transition-all disabled:opacity-50">
                            <option value=""> Choose a product </option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                        </select>
                    </div>

                    <div className="rounded-2xl card-theme p-4 sm:p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <div className="font-bold">
                                    <label className="text-[14px] text-gray-400">Size</label>
                                </div>
                                <select value={size} onChange={e => setSize(e.target.value)} className="w-full rounded-xl input-theme px-3 py-3 text-sm text-gray-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 cursor-pointer transition-all">
                                    <option value="">Select</option>
                                    {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <div className="font-bold">
                                        <label className="text-[14px] text-gray-400">Color</label>
                                    </div>
                                    {color && (
                                        <div className="h-3 w-3 rounded-full border border-gray-200"
                                             style={{backgroundColor: COLOR_HEX_MAP[color] || '#ccc'}}/>
                                    )}
                                </div>
                                <select value={color} onChange={e => setColor(e.target.value)}
                                        className="w-full rounded-xl input-theme px-3 py-3 text-sm text-gray-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 cursor-pointer transition-all">
                                    <option value="">Select</option>
                                    {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <div className="font-bold">
                                    <label className="text-[14px] text-gray-400">Stock</label>
                                </div>
                                <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)}
                                       className="w-full rounded-xl input-theme px-3 py-3 text-sm text-gray-500 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"/>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[14px] font-bold text-gray-400">Images ({images.length}/4)</label>
                                {images.length < 4 && (
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 text-[14px] font-bold uppercase tracking-wider text-emerald-500 hover:text-emerald-600 transition-colors">
                                        <ImagePlus className="h-3.5 w-3.5" /> Add
                                    </button>
                                )}
                                <input type="file" multiple accept="image/png,image/jpeg,image/jpg" className="hidden" ref={fileInputRef} onChange={e => { handleFilesSelected(e.target.files); e.target.value = ''; }} />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {Array.from({ length: 4 }).map((_, imgIdx) => {
                                    const img = images[imgIdx];
                                    return (
                                        <div key={imgIdx} onClick={() => { if (!img) fileInputRef.current?.click(); }} className={`relative aspect-square rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${img ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 bg-white cursor-pointer custom-main-color-border-hover hover:bg-emerald-50/20'}`}>
                                            {img ? (
                                                <>
                                                    <img src={img.preview} alt="v-img" className="h-full w-full object-cover rounded-xl" />
                                                    <button type="button" onClick={e => { e.stopPropagation(); removeImage(imgIdx); }} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow text-gray-400 hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
                                                </>
                                            ) : <ImagePlus className="h-5 w-5 text-gray-200" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 sm:px-8 py-5 shrink-0">
                    <button type="button" onClick={onClose} disabled={submitting} className="rounded-full card-theme px-6 py-2.5 text-sm font-medium text-gray-500 cursor-pointer">Cancel</button>
                    <button type="button" onClick={handleSubmit} disabled={submitting} className="rounded-full custom-main-color-button px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#7ba2a0] transition-colors disabled:opacity-60 cursor-pointer shadow-sm">
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditVariants;