"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Upload, Loader2 } from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import { promotionService } from "@/src/app/components/modules/promotions/core/services/promotionService";

interface AddPromotionProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddPromotion = ({ onClose, onSuccess }: AddPromotionProps) => {
    const { showToast } = useAlert();

    const [isActive, setIsActive] = useState(true);
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("percent");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isNewImage, setIsNewImage] = useState(false); // Track if a new image was uploaded
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSlugCustomized, setIsSlugCustomized] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // Clean up local blob URLs to prevent memory leaks
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

            // Verify file size structure rules (Max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showToast("Image must be smaller than 2MB.", "error");
            } else {
                showToast("Image selected successfully.", "success");
            }
        }
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        setImageFile(null);
        setPreviewUrl(null);
        setIsNewImage(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear file input field stream
        }
    };

    const handleSubmit = async () => {
        if (!name || !slug || !amount || !startDate || !endDate || !imageFile) {
            showToast("Missing required fields (Name, Amount, Dates, Image)", "warning");
            return;
        }

        // Prevent submission if the user uploads a file exceeding 2MB
        if (imageFile.size > 2 * 1024 * 1024) {
            showToast("Image must be smaller than 2MB.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('slug', slug);
            formData.append('description', description);
            formData.append('amount', amount);
            formData.append('type', type);
            formData.append('start_date', startDate.replace('T', ' '));
            formData.append('end_date', endDate.replace('T', ' '));
            formData.append('is_active', isActive ? "1" : "0");
            formData.append('banner_image', imageFile);

            const response = await promotionService.createPromotion(formData);
            if (!response.error) {
                showToast("Promotion created successfully!", "success");
                if (typeof onSuccess === 'function') onSuccess();
                onClose();
            } else {
                showToast(response.error.message || "Submission failed", "error");
            }
        } catch (error) {
            console.error("Error:", error);
            showToast("An unexpected error occurred", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isImageOverSize = !!(imageFile && imageFile.size > 2 * 1024 * 1024);

    return (
        <div className="w-[95%] sm:w-full max-w-[600px] card-theme rounded-[24px] md:rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[80dvh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 md:px-8 py-4 md:py-6 border-b border-gray-50 shrink-0 z-10">
                <div className="flex items-center gap-2">
                    <Plus className="custom-main-color-icon w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
                    <h2 className="text-[17px] md:text-[22px] font-black text-[var(--header-text)] tracking-tight">New Promotion</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-50 rounded-full cursor-pointer">
                    <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                </button>
            </div>

            {/* Body Form */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 md:px-8 py-5 md:py-6">
                <div className="space-y-6">

                    {/* Banner Upload area */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className=" text-[12px] sm:text-[14px] font-medium text-gray-500">Promotion Banner</label>
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

                                    {/* Hover view standard element overlay logic block */}
                                    {!isImageOverSize && (
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all pointer-events-none">
                                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                                <Upload className="text-white" size={24} />
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-1.5 group-hover:bg-transparent transition-colors">
                                    <div className="p-3 card-theme rounded-lg group-hover:bg-white transition-colors">
                                        <Upload className="text-slate-400 w-7 h-7" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[1px]">Upload Banner Image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="space-y-1.5 md:col-span-2">
                                <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Promotion
                                    Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                className="w-full px-4 md:px-5 py-3 md:py-4 input-theme rounded-[20px] text-sm font-bold outline-none focus:border-emerald-500/30 transition-all"
                                placeholder="Enter Name"
                            />
                        </div>

                        {/* Slug */}
                        <div className="space-y-1.5">
                                <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={handleSlugChange}
                                className="w-full px-4 md:px-5 py-3 md:py-4 input-theme rounded-[20px] text-sm font-bold outline-none focus:border-emerald-500/30 transition-all"
                                placeholder="enter-name"
                            />
                        </div>

                        <div className="space-y-1.5">
                                <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Discount Amount</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-4 md:px-5 py-3 md:py-4 input-theme rounded-[20px] text-sm font-bold outline-none focus:border-emerald-500/30 transition-all"
                                    placeholder="% & $"
                                />
                                <div
                                    className="absolute right-3 top-1/2 -translate-y-1/2 flex card-theme rounded-xl p-1">
                                    <button
                                        type="button"
                                        onClick={() => setType('percent')}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${type === 'percent' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}
                                    >%
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('fixed')}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${type === 'fixed' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}
                                    >$
                                    </button>
                                </div>
                            </div>
                        </div>


                        <div className="space-y-1.5">
                                <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Start Date</label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 md:px-5 py-3 md:py-4 input-theme rounded-[20px] text-sm font-bold outline-none focus:border-emerald-500/30 transition-all"
                            />
                        </div>

                        {/* End Date */}
                        <div className="space-y-1.5">
                                <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">End Date</label>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 md:px-5 py-3 md:py-4 input-theme rounded-[20px] text-sm font-bold outline-none focus:border-emerald-500/30 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                                <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full px-4 md:px-5 py-3 md:py-4 input-theme rounded-[20px] text-sm font-bold outline-none resize-none focus:border-emerald-500/30 transition-all"
                                placeholder="Enter descriptions"
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                                <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Status</label>
                            <div className="flex p-1 card-theme rounded-[20px] border border-gray-50">
                                <button type="button" onClick={() => setIsActive(true)}
                                        className={`flex-1 py-3 rounded-[15px] text-[12px] sm:text-[14px] font-black transition-all cursor-pointer ${isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'text-gray-400'}`}>Active
                                </button>
                                <button type="button" onClick={() => setIsActive(false)}
                                        className={`flex-1 py-3 rounded-[15px] text-[12px] sm:text-[14px] font-black transition-all cursor-pointer ${!isActive ? 'bg-gray-50 text-slate-600 border border-gray-200' : 'text-gray-400'}`}>Inactive
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Form Submissions */}
            <div className="px-6 md:px-8 py-5 border-t shrink-0">
                <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors disabled:opacity-40 cursor-pointer">Cancel</button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 px-4 py-3 custom-main-color-button custom-main-color-button-hover text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Create Promotion"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddPromotion;