'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2, Plus, ChevronDown } from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import { damageService } from "@/src/app/components/modules/damage/core/services/damageService";
import { Product as ProductType } from "@/src/app/components/modules/products/core/models/productModel";
import { productClient } from "@/src/app/components/modules/products/core/api/productClient";

interface AddProductDamageProps {
    onClose: () => void;
    onSuccess: () => void;
}

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const AddProductDamage = ({ onClose, onSuccess }: AddProductDamageProps) => {
    const { showToast } = useAlert();
    const [loading, setLoading] = useState(false);
    const [fetchingProducts, setFetchingProducts] = useState(false);
    const [products, setProducts] = useState<ProductType[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadProducts = async () => {
            setFetchingProducts(true);
            try {
                const response = await productClient.fetchProducts();
                if (response?.data?.product && Array.isArray(response.data.product)) {
                    setProducts(response.data.product);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setFetchingProducts(false);
            }
        };
        loadProducts();
    }, []);

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;

        if (!file) return;

        if (file.size > MAX_FILE_SIZE_BYTES) {
            showToast(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB.`, "error");
        } else {
            showToast("Image selected successfully.", "success");
        }

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);

            formData.delete('image');
            formData.delete('image_proof');

            if (selectedFile) {
                formData.append('image', selectedFile, selectedFile.name);
            }

            for (const [key, value] of formData.entries()) {
                console.log(`[FormData] ${key}:`, value);
            }

            const response = await damageService.addProductDamage(formData);

            if (!response.error) {
                showToast("Damage report submitted successfully!", "success");
                onSuccess();
                onClose();
            } else {
                showToast(response.error.message || "Failed to submit. Please check your inputs.", "warning");
            }
        } catch (error: any) {
            console.error("Submission failed:", error);
            showToast(error?.message ?? "Failed to submit. Please check your inputs.", "error");
        } finally {
            setLoading(false);
        }
    };

    const isOversized = selectedFile ? selectedFile.size > MAX_FILE_SIZE_BYTES : false;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
            <div className="card-theme rounded-3xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 shrink-0">
                    <div className="flex items-center gap-2">
                        <Plus className="custom-main-color-icon w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
                        <h2 className="text-[17px] md:text-[22px] font-black text-[var(--header-text)] tracking-tight">Add Damage</h2>
                    </div>
                    <button onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-50 rounded-full cursor-pointer">
                        <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 sm:p-8 flex-1">
                    <form id="damage-form" onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">

                        {/* Product */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-1.5 ml-1">Select Product Name</label>
                            <div className="relative">
                                <select
                                    name="product_id"
                                    required
                                    defaultValue=""
                                    disabled={fetchingProducts}
                                    className="w-full px-4 py-3 input-theme rounded-2xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                                >
                                    <option value="" disabled>
                                        {fetchingProducts ? "Loading products..." : "Choose a product name"}
                                    </option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.productName}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    {fetchingProducts ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown size={18} />}
                                </div>
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-1.5 ml-1">Reason</label>
                            <input
                                name="reason"
                                type="text"
                                required
                                className="w-full px-4 py-3 input-theme rounded-2xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                placeholder="Why is it damaged?"
                            />
                        </div>

                        {/* Quantity + Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1.5 ml-1">Quantity</label>
                                <input
                                    name="quantity"
                                    type="number"
                                    required
                                    min={1}
                                    className="w-full px-4 py-3 input-theme rounded-2xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1.5 ml-1">Status</label>
                                <select
                                    name="status"
                                    className="w-full px-4 py-3 input-theme rounded-2xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none text-slate-700"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="discarded">Discarded</option>
                                </select>
                            </div>
                        </div>

                        {/* Proof Image */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5 ml-1">
                                <label className="block text-sm font-semibold text-gray-400">
                                    Proof Image
                                </label>
                                <span className="text-xs text-gray-400 font-medium">Max {MAX_FILE_SIZE_MB}MB</span>
                            </div>

                            {previewUrl ? (
                                <div className={`relative w-full h-32 rounded-2xl overflow-hidden border ${isOversized ? 'border-red-400' : 'border-slate-200'}`}>
                                    <img src={previewUrl} alt="proof preview" className="w-full h-full object-center object-contain" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className={`absolute top-2 right-2 rounded-full p-1 transition-colors text-white ${isOversized ? 'bg-red-500 hover:bg-red-600' : 'bg-black/50 hover:bg-black/70'}`}
                                        aria-label="Remove image"
                                    >
                                        <X className="w-3.5 h-3.5 cursor-pointer" />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-3 py-1.5">
                                        <p className="text-xs text-white truncate">{selectedFile?.name}</p>
                                    </div>
                                </div>
                            ) : (
                                <label
                                    htmlFor="proof-image-input"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer card-theme hover:bg-slate-100 transition-colors"
                                >
                                    <Upload className="w-6 h-6 mb-2 text-slate-400" />
                                    <p className="text-xs text-slate-500 text-center px-4">Click to upload proof image</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP · Max {MAX_FILE_SIZE_MB}MB</p>
                                </label>
                            )}

                            <input
                                id="proof-image-input"
                                name="image"
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-50 bg-inherit rounded-b-3xl shrink-0">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            form="damage-form"
                            type="submit"
                            disabled={loading || fetchingProducts}
                            className="w-full flex items-center justify-center gap-2 px-4 py-4 custom-main-color-button custom-main-color-button-hover text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Submit Report"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProductDamage;