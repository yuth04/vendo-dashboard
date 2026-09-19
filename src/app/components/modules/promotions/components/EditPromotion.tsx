"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Edit3, X, Upload, Loader2 } from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import { promotionService } from "@/src/app/components/modules/promotions/core/services/promotionService";


interface EditPromotionProps {
    data: any;
    onClose: () => void;
    onSuccess: () => void;
}

const EditPromotion = ({ data, onClose, onSuccess }: EditPromotionProps) => {
    const { showToast } = useAlert();

    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const formatDateForInput = (dateStr: string | null | undefined): string => {
        if (!dateStr) return "";
        try {
            const trimmed = dateStr.replace(/\s+/g, ' ').trim();

            // Handle: "DD-MM-YYYY HH:MM:SS AM/PM"
            const match = trimmed.match(
                /^(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?$/i
            );
            if (match) {
                const [, dd, mm, yyyy, rawHours, minutes, , meridiem] = match;
                let hours = parseInt(rawHours, 10);
                if (meridiem) {
                    const isPM = meridiem.toUpperCase() === 'PM';
                    if (isPM && hours !== 12) hours += 12;
                    if (!isPM && hours === 12) hours = 0;
                }
                return `${yyyy}-${mm}-${dd}T${String(hours).padStart(2, '0')}:${minutes}`;
            }

            const date = new Date(trimmed.replace(' ', 'T'));
            if (!isNaN(date.getTime())) {
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            }

            return "";
        } catch {
            return "";
        }
    };

    const [isActive, setIsActive] = useState(!!data.is_active);
    const [name, setName] = useState(data.name || "");
    const [slug, setSlug] = useState(data.slug || slugify(data.name || ""));
    const [description, setDescription] = useState(data.description || "");
    const [amount, setAmount] = useState(data.amount || "");
    const [type, setType] = useState(data.type || "percent");
    const [startDate, setStartDate] = useState(formatDateForInput(data.start_date));
    const [endDate, setEndDate] = useState(formatDateForInput(data.end_date));

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(data.banner_image || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isNewImage, setIsNewImage] = useState(false);

    const [isSlugCustomized, setIsSlugCustomized] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Clean up temporary local URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        if (!isSlugCustomized) {
            setSlug(slugify(val));
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(e.target.value);
        setIsSlugCustomized(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Clean up old local blob if it exists
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }

            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setIsNewImage(true);

            // Check file size limit (2MB)
            if (file.size > 2 * 1024 * 1024) {
                showToast("Image must be smaller than 2MB.", "error");
            } else {
                showToast("Image selected successfully.", "success");
            }
        }
    };

    // FIXED: Smart removal logic
    const handleRemoveFile = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Clean up temporary blob string if it exists
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        if (isNewImage) {
            // Case 1: If a new image was uploaded, go back to the original database image
            setImageFile(null);
            setPreviewUrl(data.banner_image || null);
            setIsNewImage(false);
        } else {
            // Case 2: If it's the old original image, remove it completely
            setImageFile(null);
            setPreviewUrl(null);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset input element
        }
    };

    const handleSubmit = async () => {
        if (!name || !slug || !amount || !startDate || !endDate) {
            showToast("Required: Name, Amount, and Dates", "warning");
            return;
        }

        if (imageFile && imageFile.size > 2 * 1024 * 1024) {
            showToast("Image must be smaller than 2MB.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('name', name);
            formData.append('slug', slug);
            formData.append('description', description || "");
            formData.append('amount', amount.toString());
            formData.append('type', type);
            formData.append('start_date', startDate.replace('T', ' '));
            formData.append('end_date', endDate.replace('T', ' '));
            formData.append('is_active', isActive ? "1" : "0");

            // If an image file exists, append it.
            // Note: If previewUrl is null here, you can choose to append empty/delete triggers based on backend APIs
            if (imageFile) {
                formData.append('banner_image', imageFile);
            }

            const response = await promotionService.updatePromotion(data.id, formData);

            if (!response.error) {
                showToast("Promotion updated successfully!", "success");
                onClose();
                onSuccess();
            } else {
                const apiError = response.error.message || response.message || "";
                if (apiError.toLowerCase().includes("image") || apiError.toLowerCase().includes("upload")) {
                    showToast("Image must be smaller than 2MB.", "error");
                } else {
                    showToast(apiError || "Update failed", "error");
                }
            }
        } catch (error: any) {
            console.error("Submit Error:", error);
            const serverMessage = error?.response?.data?.message || error?.message || "";
            if (serverMessage.toLowerCase().includes("image") || serverMessage.toLowerCase().includes("upload")) {
                showToast("Image must be smaller than 2MB.", "error");
            } else {
                showToast("An unexpected error occurred", "error");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isImageOverSize = !!(imageFile && imageFile.size > 2 * 1024 * 1024);

    return (
        <div className="w-[95%] sm:w-full max-w-[600px] card-theme rounded-[24px] md:rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[80dvh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 md:px-8 py-4 md:py-6 border-b border-gray-50 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-2 custom-main-color-card rounded-full">
                        <Edit3 className="custom-main-color-icon w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
                    </div>
                    <h2 className="text-[18px] md:text-[22px] font-black text-[var(--header-text)]">Edit Promotion</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 card-theme hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full transition-colors cursor-pointer">
                    <X size={24} />
                </button>
            </div>


            <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto no-scrollbar">

                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[12px] sm:text-[14px] font-medium text-gray-500">Promotion Banner</label>
                        <span className="text-xs text-gray-400 font-medium">Max 2MB</span>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full h-40 border-2 border-dashed rounded-[24px] flex items-center justify-center cursor-pointer overflow-hidden relative group transition-all ${isImageOverSize ? 'border-red-400 bg-red-50/10' : 'border-gray-200 custom-main-color-border-hover'}`}
                    >
                        {previewUrl ? (
                            <>
                                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />

                                {isNewImage && (
                                    <div className="absolute top-3 left-3 bg-[#3cd08e] text-white text-xs font-black px-3 py-1 rounded-full shadow-sm z-10 pointer-events-none">
                                        New
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className={`absolute top-3 right-3 rounded-full p-2 transition-colors shadow-md z-10 ${
                                        isImageOverSize
                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                            : 'bg-black/40 hover:bg-black/60 text-white'
                                    }`}
                                    aria-label="Remove banner image"
                                >
                                    <X className="w-3.5 h-3.5 text-white cursor-pointer" strokeWidth={2.5} />
                                </button>

                                {!isImageOverSize && (
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all pointer-events-none">
                                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                            <Upload className="text-white" size={24} />
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="text-slate-300 w-6 h-6" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Change Banner</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="md:col-span-2 space-y-1">
                            <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Promotion Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            className="w-full px-5 py-3.5 input-theme rounded-[20px] text-sm font-bold outline-none focus:border-emerald-200 transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                            <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={handleSlugChange}
                            className="w-full px-5 py-3.5 input-theme rounded-[20px] text-sm font-bold outline-none focus:border-emerald-200 transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                            <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Discount Amount</label>
                        <div className="relative">
                        <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-5 py-3.5 input-theme rounded-[20px] text-sm font-bold outline-none"
                            />
                            <div
                                className="absolute right-2 top-1/2 -translate-y-1/2 flex p-1 card-theme rounded-xl border">
                                <button
                                    type="button"
                                    onClick={() => setType('percent')}
                                    className={`px-2 py-1 text-[10px] font-black rounded-lg ${type === 'percent' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}
                                >%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('fixed')}
                                    className={`px-2 py-1 text-[10px] font-black rounded-lg ${type === 'fixed' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}
                                >$
                                </button>
                            </div>
                        </div>
                    </div>


                    <div className="space-y-1">
                            <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Start Date</label>
                        <input
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-5 py-3.5 input-theme rounded-[20px] text-sm font-bold outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                            <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">End Date</label>
                        <input
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-5 py-3.5 input-theme rounded-[20px] text-sm font-bold outline-none"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                        <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full px-5 py-3.5 input-theme rounded-[20px] text-sm font-bold outline-none resize-none"
                        />
                    </div>


                    <div className="md:col-span-2 space-y-1">
                        <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Status</label>
                        <div className="flex p-1 card-theme rounded-[20px] h-[52px]">
                            <button
                                type="button"
                                onClick={() => setIsActive(true)}
                                className={`flex-1 rounded-[15px] text-[12px]  sm:text-[14px] font-black transition-all cursor-pointer ${isActive ? 'bg-emerald-100 text-emerald-600 border border-emerald-300' : 'text-gray-400'}`}
                            >Active
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsActive(false)}
                                className={`flex-1 rounded-[15px] text-[12px]  sm:text-[14px]  font-black transition-all cursor-pointer ${!isActive ? 'bg-white text-slate-600 shadow-sm border border-gray-200' : 'text-gray-400'}`}
                            >Inactive
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <div className="px-6 md:px-8 py-5 border-t shrink-0">
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 px-4 py-3 custom-main-color-button custom-main-color-button-hover text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Update Promotion"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPromotion;