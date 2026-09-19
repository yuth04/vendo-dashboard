'use client';

import React, { useState, ChangeEvent } from "react";
import { Plus, X, UploadCloud } from "lucide-react";
import { useAlert } from "@/src/app/components/context/AlertContext";
import * as BrandService from "@/src/app/components/modules/settings/brands/core/services/brandService";

interface AddBrandModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRefresh?: () => void;
}

const AddBrandModal = ({ isOpen, onClose, onRefresh }: AddBrandModalProps) => {
    const { showToast } = useAlert();
    const [name, setName] = useState<string>('');
    const [slug, setSlug] = useState<string>('');
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    if (!isOpen) return null;

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        setSlug(BrandService.generateSlug(val));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!name || !slug) {
            return showToast("Please enter both Name and Slug", "warning");
        }
        setIsSubmitting(true);
        try {
            const res = await BrandService.createBrandLogic({
                name,
                slug,
                status,
                imageFile
            });

            if (res.error) {
                showToast(res.error.message || "Failed to create brand", "error");
            } else {
                showToast("Brand created successfully", "success");
                setName('');
                setSlug('');
                setImageFile(null);
                setPreviewUrl(null);
                onClose();
                if (onRefresh) onRefresh();
            }
        } catch (err) {
            showToast("An unexpected error occurred", "error");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/10 backdrop-blur-md p-4">
            <div className="w-full max-w-[500px] rounded-[32px] md:rounded-[40px] card-theme shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[80dvh]">

                <div className="flex items-center justify-between border-b border-gray-50 p-6 md:p-8 shrink-0">
                    <div className="flex items-center gap-3 text-gray-900 font-black text-lg md:text-xl">
                        <Plus className="custom-main-color-text w-5 h-5 md:w-6 md:h-6" size={24} strokeWidth={3} />
                        <span className="text-[var(--header-text)]">New Brand</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors custom-main-color-text cursor-pointer p-1">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 space-y-6">

                    <div className="flex flex-col items-center gap-4">
                        <div className="group relative flex h-28 w-28 md:h-32 md:w-32 cursor-pointer flex-col items-center justify-center rounded-[28px] md:rounded-[32px] border-2 border-dashed border-gray-200 bg-gray-50/50 transition-all custom-main-color-border-hover overflow-hidden">
                            {previewUrl ? (
                                <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" />
                            ) : (
                                <>
                                    <UploadCloud className="mb-1 text-gray-400 custom-main-color-text-hover" size={24} />
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Upload Logo</span>
                                </>
                            )}
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 cursor-pointer opacity-0" />
                        </div>
                    </div>

                    <div className="space-y-4 md:space-y-5">
                        <div>
                                <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Brand Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                className="w-full rounded-2xl input-theme p-3.5 md:p-4 text-xs md:text-sm font-bold text-gray-900 outline-none focus:bg-white"
                                placeholder="Brand Name"
                            />
                        </div>

                        <div>
                                <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Slug</label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
                                className="w-full rounded-2xl input-theme p-3.5 md:p-4 text-xs md:text-sm font-bold outline-none placeholder:text-blue-500 focus:bg-white"
                                placeholder="brand-name"
                            />
                        </div>
                    </div>

                    <div>
                            <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Status</label>
                        <div className="flex h-[50px] md:h-[58px] w-full items-center rounded-[20px] input-theme p-1.5">
                            <button
                                onClick={() => setStatus('active')}
                                className={`flex-1 h-full rounded-[20px] text-[10px] md:text-[14px] font-black transition-all cursor-pointer ${status === 'active' ? 'bg-emerald-100 border-emerald-300 text-emerald-600' : 'text-gray-500'}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setStatus('inactive')}
                                className={`flex-1 h-full rounded-[20px] text-[10px] md:text-[14px] font-black transition-all cursor-pointer ${status === 'inactive' ? 'bg-white text-gray-500 shadow-sm border border-gray-100' : 'text-gray-500'}`}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 p-6 md:p-8 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 md:px-6 py-3 text-[10px] md:text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 rounded-[20px] custom-main-color-button custom-main-color-button-hover px-6 md:px-10 py-3 text-xs md:text-sm font-black text-white shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        Create Brand
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBrandModal;