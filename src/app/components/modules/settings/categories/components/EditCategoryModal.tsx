'use client';

import React, { useState, useEffect, ChangeEvent } from "react";
import { Edit3, X, Upload, ChevronDown, Loader2 } from "lucide-react";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { Category } from "@/src/app/components/modules/settings/categories/core/models/categoriesModel";
import { categoriesClient } from "@/src/app/components/modules/settings/categories/core/api/categoriesClient";
import {CategoryService} from "@/src/app/components/modules/settings/categories/core/services/categoriesService";


interface EditCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
    categoryData: Category | null;
}

const EditCategoryModal = ({ isOpen, onClose, onRefresh, categoryData }: EditCategoryModalProps) => {
    const { showToast } = useAlert();
    const [loading, setLoading] = useState<boolean>(false);
    const [parentCategories, setParentCategories] = useState<Category[]>([]);

    const [name, setName] = useState<string>("");
    const [slug, setSlug] = useState<string>("");
    const [parentId, setParentId] = useState<string | number>("");
    const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && categoryData) {
            setName(categoryData.name || "");
            setSlug(categoryData.slug || "");
            setParentId(categoryData.parent_category_id || "");
            setStatus(categoryData.is_active ? 'ACTIVE' : 'INACTIVE');
            setPreviewUrl(categoryData.image || null);
            setImageFile(null);
        }
    }, [categoryData, isOpen]);

    useEffect(() => {
        if (isOpen) {
            const loadParents = async () => {
                try {
                    const res: any = await categoriesClient.fetchParentCategories();
                    if (!res.error && res.data) {
                        const categories = res.data.data || res.data || [];
                        setParentCategories(Array.isArray(categories) ? categories : []);
                    }
                } catch (err) {
                    console.error("Failed to load parent categories", err);
                }
            };
            loadParents();
        }
    }, [isOpen, categoryData]);

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async () => {
        if (!name.trim()) return showToast("Category name is required", "error");
        if (!categoryData?.id) return showToast("Missing category ID", "error");

        setLoading(true);
        try {
            const res = await CategoryService.updateCategoryLogic(categoryData.id, {
                name,
                slug,
                status,
                parentId,
                imageFile
            });

            if (res && !res.error) {
                showToast("Category updated successfully!", "success");
                if (typeof onRefresh === 'function') {
                    onRefresh();
                }
                onClose();
            } else {
                showToast(res?.error?.message || "Failed to update category", "error");
            }
        } catch (err) {
            console.error("Update Error:", err);
            showToast("A server error occurred", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/10 backdrop-blur-md p-4">
            <div className="w-full max-w-[500px] rounded-[32px] md:rounded-[40px] card-theme shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80dvh]">

                <div className="flex items-center justify-between border-b border-gray-50 p-6 md:p-8 shrink-0">
                    <div className="flex items-center gap-3 text-gray-900 font-black text-lg md:text-xl">
                        <Edit3 className="custom-main-color-icon w-5 h-5 md:w-6 md:h-6" strokeWidth={3}/>
                        <span className="text-[var(--header-text)]">Edit Category</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1">
                        <X size={24}/>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 space-y-6">
                    <div className="flex justify-center">
                        <div className="group relative flex h-28 w-28 md:h-32 md:w-32 cursor-pointer flex-col items-center justify-center rounded-[28px] md:rounded-[32px] border-2 border-dashed border-gray-200 bg-gray-50/50 transition-all custom-main-color-border-hover overflow-hidden">
                            {previewUrl ? (
                                <img src={previewUrl} className="h-full w-full object-cover" alt="preview"/>
                            ) : (
                                <>
                                    <Upload className="mb-1 text-gray-400 group-hover:text-cyan-400" size={24}/>
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Upload</span>
                                </>
                            )}
                            <input type="file" className="absolute inset-0 cursor-pointer opacity-0" accept="image/*" onChange={handleImageChange}/>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="py-1">
                                <label className="text-[12px] sm:text-[14px] font-medium text-gray-500">Category Name</label>
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                className="w-full rounded-[20px] input-theme p-3.5 md:p-4 text-xs md:text-sm font-bold text-gray-900 outline-none focus:border-cyan-400"
                                placeholder="e.g. T-Shirts"
                            />
                        </div>

                        <div>
                            <div className="py-1">
                                <label className="text-[12px] sm:text-[14px] font-medium text-gray-500">Slug</label>
                            </div>
                            <input
                                type="text"
                                value={slug}
                                readOnly
                                className="w-full rounded-2xl input-theme p-3.5 md:p-4 text-[10px] md:text-xs font-bold text-gray-400 outline-none"
                            />
                        </div>

                        <div>
                            <div className="py-1">
                                <label className="text-[12px] sm:text-[14px] font-medium text-gray-500">Parent Category</label>
                            </div>
                            <div className="relative">
                                <select
                                    value={parentId}
                                    onChange={(e) => setParentId(e.target.value)}
                                    className="w-full appearance-none rounded-[20px] input-theme p-3.5 md:p-4 pr-12 text-xs md:text-sm font-bold text-gray-900 outline-none focus:border-cyan-400"
                                >
                                    <option value="">Select Parent Category</option>
                                    {parentCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18}/>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="py-1">
                            <label className="text-[12px] sm:text-[14px] font-medium text-gray-500">Status</label>
                        </div>
                        <div className="flex h-[50px] md:h-[58px] w-full items-center rounded-[20px] card-theme p-1.5">
                            <button
                                type="button"
                                onClick={() => setStatus('ACTIVE')}
                                className={`flex-1 h-full rounded-[20px] text-[10px] md:text-[14px] font-black transition-all cursor-pointer ${status === 'ACTIVE' ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' : 'text-gray-500'}`}
                            >
                                Active
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('INACTIVE')}
                                className={`flex-1 h-full rounded-[20px] text-[10px] md:text-[14px] font-black transition-all cursor-pointer ${status === 'INACTIVE' ? 'bg-white text-gray-500 shadow-sm border border-gray-100' : 'text-gray-500'}`}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 md:gap-8 border-t border-gray-50 p-6 md:p-8 shrink-0">
                    <button onClick={onClose} className="px-5 md:px-6 py-3 text-[10px] md:text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors disabled:opacity-40 cursor-pointer">Cancel</button>
                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-[20px] custom-main-color-button custom-main-color-button-hover px-6 md:px-10 py-3 text-xs md:text-sm font-black text-white shadow-xl active:scale-95 cursor-pointer"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditCategoryModal;