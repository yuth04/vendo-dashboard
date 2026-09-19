'use client';

import React, { useState, useEffect, ChangeEvent } from "react";
import { Plus, X, UploadCloud, Edit3 } from "lucide-react";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { Brand } from "@/src/app/components/modules/settings/brands/core/models/brandModel";
import { BASE_URL } from '@/src/app/components/services/utils/config';
import * as BrandService from "@/src/app/components/modules/settings/brands/core/services/brandService";

interface EditBrandModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
    initialData?: Brand | null;
}

const EditBrandModal = ({ isOpen, onClose, onRefresh, initialData = null }: EditBrandModalProps) => {
    const { showToast } = useAlert();

    const [name, setName] = useState<string>('');
    const [slug, setSlug] = useState<string>('');
    const [status, setStatus] = useState<string>('active');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const isEdit = !!initialData;

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || '');
                setSlug(initialData.slug || '');
                setStatus(initialData.status?.toLowerCase() || 'active');
                setPreviewUrl(BrandService.getFormattedImageUrl(initialData.image ?? "", BASE_URL ?? ""));
            } else {
                setName('');
                setSlug('');
                setStatus('active');
                setPreviewUrl(null);
                setImageFile(null);
            }
        }
    }, [initialData, isOpen]);

    const handleNameChange = (val: string) => {
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
        if (!name) return showToast("Please enter brand name", "warning");

        setIsSubmitting(true);
        try {
            const payload = { name, slug, status, imageFile };

            const res = isEdit && initialData
                ? await BrandService.updateBrandLogic(initialData.id, payload)
                : await BrandService.createBrandLogic(payload);

            if (res.error) {
                showToast(res.error.message || "Operation failed", "error");
            } else {
                showToast(
                    isEdit ? "Brand updated successfully!" : "Brand created successfully!",
                    "success"
                );
                onClose();
                onRefresh();
            }
        } catch (err) {
            showToast("Server connection error", "error");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 backdrop-blur-md p-4">
            <div className="w-full max-w-[500px] rounded-[32px] md:rounded-[40px] card-theme shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[80dvh] overflow-hidden">

                <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-50 shrink-0">
                    <h2 className="text-lg md:text-xl font-black flex items-center gap-2">
                        {isEdit ? <Edit3 className="custom-main-color-icon w-5 h-5" /> : <Plus className="text-cyan-400 w-5 h-5" />}
                        <span className="text-[var(--header-text)]">{isEdit ? 'Update Brand' : 'New Brand'}</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 cursor-pointer p-1">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 space-y-6">
                    <div className="flex justify-center">
                        <div className="relative h-24 w-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden custom-main-color-border-hover transition-all bg-gray-50/50">
                            {previewUrl ? <img src={previewUrl} className="object-contain h-full w-full" alt="Preview" /> : <UploadCloud className="text-gray-300" />}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                                <span className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Brand Name</span>
                            <input
                                value={name}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleNameChange(e.target.value)}
                                placeholder="e.g. Nike"
                                className="w-full mt-1 p-3.5 md:p-4 input-theme rounded-[20px] outline-none focus:bg-white border border-transparent focus:border-cyan-400 transition-all font-bold text-sm"
                            />
                        </div>

                        <div>
                                <span className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Slug</span>
                            <input
                                value={slug}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
                                placeholder="nike-pro"
                                className="w-full mt-1 p-3.5 md:p-4 input-theme rounded-[20px] outline-none text-blue-500 font-medium text-sm"
                            />
                        </div>
                    </div>

                    <div>
                            <span className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Status</span>
                        <div className="flex bg-gray-100 p-1.5 rounded-[20px] card-theme h-[54px] md:h-[58px]">
                            <button onClick={() => setStatus('active')} className={`flex-1 rounded-[20px] text-[14px] sm:text-[14px] font-bold transition-all cursor-pointer ${status === 'active' ? 'bg-emerald-100 border border-emerald-300 text-emerald-600' : 'text-gray-500'}`}>Active</button>
                            <button onClick={() => setStatus('inactive')} className={`flex-1 rounded-[20px] text-[14px] sm:text-[14px] font-bold transition-all cursor-pointer ${status === 'inactive' ? 'bg-white text-gray-500 shadow-sm border border-gray-100' : 'text-gray-500'}`}>Inactive</button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4 p-6 md:p-8 border-t border-gray-50 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 py-3.5 md:py-4 text-xs md:text-sm font-black text-gray-400 card-theme rounded-[20px] hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-[2] py-3.5 md:py-4 custom-main-color-button custom-main-color-button-hover text-white text-xs md:text-sm font-black rounded-[20px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl active:scale-95 disabled:opacity-50"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditBrandModal;