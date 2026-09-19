'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { productService } from '@/src/app/components/modules/products/core/services/productService';
import { Category, Brand } from '@/src/app/components/modules/products/core/models/productModel';
import {useAlert} from "@/src/app/components/context/AlertContext";

interface AddProductProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface FormState {
    productName: string;
    description: string;
    price: string;
    category_id: string;
    brand_id: string;
    status: 'active' | 'inactive';
    image: File | null;
}

const INITIAL_FORM: FormState = {
    productName: '',
    description: '',
    price: '0.00',
    category_id: '',
    brand_id: '',
    status: 'active',
    image: null,
};

const AddProduct = ({ isOpen, onClose, onSuccess }: AddProductProps) => {
    const { showToast } = useAlert();
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [preview, setPreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        setLoadingOptions(true);
        Promise.all([
            productService.getCategories(),
            productService.getBrands(),
        ]).then(([catRes, brandRes]) => {
            setCategories(catRes.data?.category ?? []);
            setBrands(brandRes.data?.brands ?? []);
        }).finally(() => setLoadingOptions(false));
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setForm(INITIAL_FORM);
            setPreview(null);
        }
    }, [isOpen]);

    const handleField = (field: keyof FormState, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleFile = (file: File | null) => {
        if (!file) return;
        setForm(prev => ({ ...prev, image: file }));
        setPreview(URL.createObjectURL(file));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0] ?? null;
        handleFile(file);
    };

    const handleSubmit = async () => {
        if (!form.productName.trim()) return showToast('Product name is required.', 'warning');

        // Character length validation alerts to prevent character varying(255) DB errors
        if (form.productName.trim().length > 255) {
            return showToast('Product name cannot exceed 255 characters.', 'warning');
        }
        if (form.description.trim().length > 255) {
            return showToast('Description cannot exceed 255 characters.', 'warning');
        }

        if (!form.category_id) return showToast('Please select a category.', 'warning');
        if (!form.price || isNaN(parseFloat(form.price))) return showToast('Please enter a valid price.', 'warning');

        const formData = new FormData();
        formData.append('productName', form.productName.trim());
        formData.append('description', form.description.trim());
        formData.append('price', parseFloat(form.price).toFixed(2));
        formData.append('category_id', form.category_id);
        formData.append('brand_id', form.brand_id);
        formData.append('status', form.status);
        if (form.image) formData.append('image', form.image);

        setSubmitting(true);
        try {
            const res = await productService.createProduct(formData);
            if (res.error) {
                showToast(res.error.message ?? 'Failed to create product.', 'error');
            } else {
                showToast('Product created successfully!', 'success');
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            showToast(err?.message ?? 'Unexpected error occurred.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="card-theme rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                            <Plus className="h-4 w-4 custom-main-color-text" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--header-text)]">Add New Product</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Fill in all details then save</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div className="space-y-5">

                        <div className="space-y-1.5">
                            <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Product
                                Name</label>
                            <input
                                type="text"
                                maxLength={255}
                                value={form.productName}
                                onChange={e => handleField('productName', e.target.value)}
                                placeholder="Enter product name"
                                className="w-full rounded-2xl input-theme px-4 py-3 text-sm text-gray-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder:text-gray-400 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => handleField('description', e.target.value)}
                                placeholder="Enter product description..."
                                rows={4}
                                className="w-full rounded-2xl input-theme px-4 py-2.5 text-sm text-gray-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder:text-gray-400 resize-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label
                                    className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Category <span
                                    className="text-red-400">*</span></label>
                                <select
                                    value={form.category_id}
                                    onChange={e => handleField('category_id', e.target.value)}
                                    disabled={loadingOptions}
                                    className="w-full rounded-2xl input-theme px-4 py-3 text-sm text-gray-700 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 cursor-pointer transition-all disabled:opacity-50"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label
                                    className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Brand</label>
                                <select
                                    value={form.brand_id}
                                    onChange={e => handleField('brand_id', e.target.value)}
                                    disabled={loadingOptions}
                                    className="w-full rounded-2xl input-theme px-4 py-3 text-sm text-gray-700 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 cursor-pointer transition-all disabled:opacity-50"
                                >
                                    <option value="">Select Brand</option>
                                    {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label
                                className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Status</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => handleField('status', 'active')}
                                        className={`rounded-2xl border py-3 text-[14px] font-bold cursor-pointer ${form.status === 'active' ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>Active
                                </button>
                                <button type="button" onClick={() => handleField('status', 'inactive')}
                                        className={`rounded-2xl border py-3 text-[14px] font-bold cursor-pointer ${form.status === 'inactive' ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>Inactive
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label
                                className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Price</label>
                            <input type="number" min="0" step="0.01" value={form.price}
                                   onChange={e => handleField('price', e.target.value)}
                                   className="w-full rounded-2xl input-theme px-4 py-3 text-sm text-gray-800 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"/>
                        </div>
                    </div>

                    {/* Right — Product Image */}
                    <div className="space-y-5">
                        <p className="text-[14px] font-semibold text-gray-500">Product Image</p>
                        <div ref={dragRef} onClick={() => fileInputRef.current?.click()} onDrop={handleDrop}
                             onDragOver={e => e.preventDefault()}
                             className="relative flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-100 transition-all custom-main-color-border-hover hover:bg-emerald-50/30">
                            {preview ? (
                                <>
                                    <img src={preview} alt="Preview"
                                         className="h-full w-full rounded-2xl object-contain p-4"/>
                                    <button type="button" onClick={e => {
                                        e.stopPropagation();
                                        setPreview(null);
                                        setForm(prev => ({...prev, image: null}));
                                    }}
                                            className="absolute right-3 top-3 rounded-full bg-white p-1 shadow-md text-gray-400 hover:text-red-400 transition-colors">
                                        <X className="h-4 w-4"/></button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-center px-6">
                                    <div
                                        className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                        <Upload className="h-5 w-5 text-gray-400"/></div>
                                    <p className="text-sm font-medium text-gray-600">Drop file or click to upload</p>
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg"
                                   className="hidden" onChange={e => handleFile(e.target.files?.[0] ?? null)}/>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 flex-shrink-0">
                    <button type="button" onClick={onClose} disabled={submitting}
                            className="rounded-full card-theme px-6 py-2.5 text-sm font-medium text-gray-500 cursor-pointer">Cancel
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={submitting}
                            className="rounded-full custom-main-color-button px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#7ba2a0] transition-colors disabled:opacity-60 cursor-pointer shadow-sm">{submitting ? 'Creating...' : 'Create Product'}</button>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;