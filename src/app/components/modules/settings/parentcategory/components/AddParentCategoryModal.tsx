'use client';

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useAlert } from "@/src/app/components/context/AlertContext";
import * as ParentCategoriesService from "../core/services/parentCategoriesService";

interface AddParentCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRefresh?: () => void;
}

const AddParentCategoryModal = ({ isOpen, onClose, onRefresh }: AddParentCategoryModalProps) => {
    const { showToast } = useAlert();
    const [name, setName] = useState('');
    const [status, setStatus] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Category name is required");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const response = await ParentCategoriesService.createParentCategoryLogic(name, status);

            if (response.error) {
                const errorMsg = response.error.message || "Failed to create category";
                setError(errorMsg);
                showToast(errorMsg, "warning");
            } else {
                showToast("Parent category created successfully!", "success");
                setName('');
                setStatus(true);
                if (onRefresh) onRefresh();
                onClose();
            }
        } catch (err: any) {
            const catchMsg = err.message || "An unexpected error occurred";
            setError(catchMsg);
            showToast(catchMsg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 backdrop-blur-sm p-3 sm:p-4">
            <div className="relative w-full max-w-[500px] max-h-[90vh] flex flex-col rounded-[30px] sm:rounded-[40px] card-theme shadow-2xl animate-in fade-in zoom-in duration-200 bg-white overflow-hidden">

                <div className="flex items-center justify-between border-b border-gray-50 p-5 sm:p-8 shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-900 font-black text-lg sm:text-xl">
                        <Plus className="custom-main-color-icon w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                        <span className="text-[var(--header-text)] truncate">New ParentCategory</span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1">
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto p-5 sm:p-8 space-y-5 sm:space-y-6">

                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Parent Category Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if(error) setError("");
                                }}
                                placeholder="parent name..."
                                className="w-full rounded-[15px] sm:rounded-[20px] input-theme p-3 sm:p-4 text-sm font-bold text-gray-900 outline-none focus:border-cyan-400 focus:bg-white placeholder:text-gray-300 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Status</label>
                        <div className="flex h-[50px] sm:h-[58px] w-full items-center rounded-2xl border border-gray-100 p-1 bg-gray-50/50">
                            <button
                                type="button"
                                onClick={() => setStatus(true)}
                                className={`flex-1 h-full rounded-[15px] sm:rounded-[20px] text-[10px] sm:text-[14px] font-black transition-all duration-300 cursor-pointer ${status === true ? 'bg-emerald-100 border border-emerald-200 text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                            >
                                Active
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus(false)}
                                className={`flex-1 h-full rounded-[15px] sm:rounded-[20px] text-[10px] sm:text-[14px] font-black transition-all duration-300 cursor-pointer ${status === false ? 'bg-white border border-gray-200 text-gray-500 shadow-sm' : 'text-gray-400'}`}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 sm:gap-4 border-t border-gray-50 p-5 sm:p-8 shrink-0">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 md:px-6 py-3 text-[10px] md:text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 rounded-[15px] sm:rounded-[20px] custom-main-color-button px-6 sm:px-10 py-2.5 sm:py-3 text-xs sm:text-sm font-black text-white cursor-pointer disabled:opacity-70 transition-all active:scale-95"
                    >
                        <span className="whitespace-nowrap">Create Parent Category</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddParentCategoryModal;