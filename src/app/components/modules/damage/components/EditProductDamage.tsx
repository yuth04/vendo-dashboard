'use client';

import React, { useState } from 'react';
import { X, Upload, Loader2, Edit3 } from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import { DamageItem } from "@/src/app/components/modules/damage/core/models/damageModel";
import { damageService } from "@/src/app/components/modules/damage/core/services/damageService";

interface EditProductDamageProps {
    item: DamageItem;
    onClose: () => void;
    onSuccess: (updated: DamageItem) => void;
}

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const EditProductDamage = ({ item, onClose, onSuccess }: EditProductDamageProps) => {
    const { showToast } = useAlert();
    const [loading, setLoading]       = useState(false);
    const [status, setStatus]         = useState(item.status.toLowerCase());
    const [reason, setReason]         = useState(item.reason);
    const [quantity, setQuantity]     = useState(String(item.quantity));
    const [imageFile, setImageFile]   = useState<File | null>(null);
    const [fileName, setFileName]     = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [removeExisting, setRemoveExisting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_BYTES) {
            showToast(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB.`, "error");
        } else {
            showToast("Image selected successfully.", "success");
        }

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const objectUrl = URL.createObjectURL(file);
        setImageFile(file);
        setFileName(file.name);
        setPreviewUrl(objectUrl);
        setRemoveExisting(false);
    };

    const handleRemoveImage = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setImageFile(null);
        setFileName(null);
        setPreviewUrl(null);
        setRemoveExisting(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('product_id', String(item.product_id ?? item.product?.id ?? item.id));
            formData.append('reason',     reason.trim());
            formData.append('quantity',   quantity);
            formData.append('status',     status);

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const result = await damageService.updateProductDamage(item.id, formData);

            if (result?.error) {
                const msg = result.error?.message || 'Validation failed. Please check your inputs.';
                showToast(msg, "error");
                return;
            }

            const updatedItem: DamageItem = {
                ...item,
                reason,
                quantity: Number(quantity),
                status,
                image_proof: result.data?.data?.image ?? (previewUrl ?? (removeExisting ? null : item.image_proof)),
            };

            showToast("Damage report updated successfully.", "success");
            onSuccess(updatedItem);
            onClose();

        } catch (error: any) {
            console.error("Update failed:", error);
            showToast(error?.message || "Failed to update damage report.", "error");
        } finally {
            setLoading(false);
        }
    };

    const displayImage = previewUrl ?? (!removeExisting ? item.image_proof ?? null : null);
    const isOversized = imageFile ? imageFile.size > MAX_FILE_SIZE_BYTES : false;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
            <div className="card-theme rounded-3xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">

                {/* Fixed Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 shrink-0">
                    <div className="flex items-center gap-2">
                        <Edit3 className="custom-main-color-icon w-5 h-5 md:w-6 md:h-6" strokeWidth={3}/>
                        <h2 className="text-[18px] md:text-[22px] font-black text-[var(--header-text)] tracking-tight">Edit Damage</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 cursor-pointer">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="overflow-y-auto p-6 sm:p-8 flex-1">
                    <label className="block text-sm font-semibold text-gray-400 mb-1.5 ml-1">Products Name</label>
                    <div className="mb-5 p-3 rounded-2xl card-theme border border-slate-200 flex items-center gap-3">
                        {item.product?.image && (
                            <img src={item.product.image} alt={item.product.name}
                                 className="w-12 h-12 rounded-xl object-center object-contain"/>
                        )}
                        <div>
                            <p className="text-xs text-gray-400 font-semibold">Product</p>
                            <p className="text-sm font-bold text-gray-400">{item.product?.name ?? 'N/A'}</p>
                        </div>
                    </div>

                    <form id="edit-damage-form" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-1.5 ml-1">Reason</label>
                            <input
                                type="text"
                                required
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                className="w-full px-4 py-3 input-theme rounded-2xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1.5 ml-1">Quantity</label>
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                    className="w-full px-4 py-3 input-theme rounded-2xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1.5 ml-1">Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="w-full px-4 py-3 input-theme rounded-2xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none text-slate-700"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="discarded">Discarded</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5 ml-1">
                                <label className="block text-sm font-semibold text-gray-400">Proof of Damage</label>
                                <span className="text-xs text-gray-400 font-medium">Max {MAX_FILE_SIZE_MB}MB</span>
                            </div>

                            {displayImage ? (
                                <div className={`mb-3 relative rounded-2xl overflow-hidden border ${isOversized ? 'border-red-400' : 'border-slate-200'}`}>
                                    <img
                                        src={displayImage}
                                        alt="Proof of damage"
                                        className="w-full h-50 object-contain object-center"
                                    />
                                    {previewUrl && !isOversized && (
                                        <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 bg-emerald-500 text-white rounded-full">
                                            New
                                        </span>
                                    )}
                                    {isOversized && (
                                        <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 bg-red-500 text-white rounded-full">
                                            Too Large
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors cursor-pointer text-white ${isOversized ? 'bg-red-500 hover:bg-red-600' : 'bg-black/50 hover:bg-black/70'}`}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="mb-3 p-4 text-center text-sm text-gray-400 border border-dashed rounded-2xl">
                                    No proof image uploaded
                                </div>
                            )}

                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer card-theme hover:bg-slate-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-6 h-6 mb-2 text-slate-400"/>
                                    <p className="text-xs text-slate-500 text-center px-4 truncate max-w-[200px]">
                                        {fileName || "Change proof image"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP · Max {MAX_FILE_SIZE_MB}MB</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </form>
                </div>

                {/* Fixed Footer Buttons */}
                <div className="p-6 border-t border-gray-50 shrink-0">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            form="edit-damage-form"
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-4 custom-main-color-button text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18}/> : "Update Report"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProductDamage;