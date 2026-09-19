"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Plus } from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import { couponService } from "@/src/app/components/modules/coupons/core/services/couponService";
import { Discount } from "@/src/app/components/modules/promotions/core/models/promotionModel";
import { promotionClient } from "@/src/app/components/modules/promotions/core/api/promotionClient";

interface AddCouponProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddCoupon = ({ onClose, onSuccess }: AddCouponProps) => {
    const { showToast } = useAlert();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [promotions, setPromotions] = useState<Discount[]>([]);
    const [isNewImage, setIsNewImage] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        type: "percent",
        value: "",
        start_date: "",
        end_date: "",
        min_amount: "",
        max_discount: "",
        usage_limit: "",
        description: "",
        status: "active",
        discount_id: ""
    });

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    useEffect(() => {
        const getPromotions = async () => {
            try {
                const response = await promotionClient.fetchPromotions();
                if (response && response.data?.discount) {
                    setPromotions(response.data.discount);
                }
            } catch (error) {
                console.error("Error fetching promotions:", error);
            }
        };
        getPromotions();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setIsNewImage(true);

        // 2MB size restriction filter
        if (file.size > 2 * 1024 * 1024) {
            showToast("Image must be smaller than 2MB.", "error");
        } else {
            showToast("Image selected successfully.", "success");
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(null);
        setImageFile(null);
        setIsNewImage(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.code || !formData.discount_id) {
            showToast("Please fill in required fields (Name, Code, Promotion)", "warning");
            return;
        }

        if (imageFile && imageFile.size > 2 * 1024 * 1024) {
            showToast("Image must be smaller than 2MB.", "error");
            return;
        }

        try {
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'start_date') payload.append(key, value ? `${value} 00:00:00` : "");
                else if (key === 'end_date') payload.append(key, value ? `${value} 23:59:59` : "");
                else payload.append(key, value);
            });

            if (imageFile) payload.append('image', imageFile);

            const response = await couponService.createCoupon(payload);
            if (!response.error) {
                showToast("Coupon created successfully!", "success");
                onSuccess();
            } else {
                showToast(response.error.message || "Failed to create", "error");
            }
        } catch (error) {
            showToast("An unexpected error occurred", "error");
        }
    };

    const isImageOverSize = !!(imageFile && imageFile.size > 2 * 1024 * 1024);

    const InputLabel = ({ text }: { text: string }) => (
        <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">
            {text}
        </label>
    );

    return (
        <div className="w-[95%] sm:w-full max-w-[600px] card-theme rounded-[24px] md:rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[80dvh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 shrink-0">
                <div className="flex items-center gap-2">
                    <Plus className="custom-main-color-icon w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
                    <h2 className="text-[17px] font-black text-[var(--header-text)]">New Coupon</h2>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full cursor-pointer">
                    <X size={20} />
                </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar">

                {/* Unified Coupon Image Upload Layout Container with Max 2MB notice */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[12px] sm:text-[14px] font-medium text-gray-500">Coupon Image</label>
                        <span className="text-xs text-gray-400 font-medium">Max 2MB</span>
                    </div>

                    <div className="flex justify-center mb-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full h-50 border-2 border-dashed rounded-[20px] flex items-center justify-center cursor-pointer overflow-hidden relative group transition-all ${isImageOverSize ? 'border-red-400 bg-red-50/10' : 'border-gray-200 custom-main-color-border-hover'}`}
                        >
                            {previewUrl ? (
                                <>
                                    <img
                                        src={previewUrl}
                                        className="w-full h-full object-cover"
                                        alt="Preview"
                                    />

                                    {/* Green "New" Badge overlay display logic */}
                                    {isNewImage && (
                                        <div className="absolute top-2 left-2 bg-[#3cd08e] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm z-10 pointer-events-none">
                                            New
                                        </div>
                                    )}

                                    {/* Responsive close button variant styling */}

                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className={`absolute top-2 right-2 rounded-full p-1.5 transition-colors shadow-md z-10 ${
                                            isImageOverSize
                                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                                : 'bg-black/40 hover:bg-black/60 text-white'
                                        }`}
                                        aria-label="Remove image"
                                    >
                                        <X className="w-4 h-4 text-white cursor-pointer" strokeWidth={2.5} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-1.5">
                                    <Upload className="text-gray-400" size={24} />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[1px]">Upload Image</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <InputLabel text="Coupon Name" />
                        <input name="name" value={formData.name} onChange={handleChange}
                               className="w-full px-4 py-3 input-theme border rounded-[16px] text-sm"
                               placeholder="Coupon Name" />
                    </div>
                    <div className="flex flex-col">
                        <InputLabel text="Coupon Code" />
                        <input name="code" value={formData.code} onChange={handleChange}
                               className="w-full px-4 py-3 input-theme border rounded-[16px] text-sm"
                               placeholder="Coupon Code" />
                    </div>

                    <div className="flex flex-col">
                        <InputLabel text="Promotions Name" />
                        <select name="discount_id" value={formData.discount_id} onChange={handleChange}
                                className="w-full px-4 py-3 input-theme border rounded-[16px] text-sm">
                            <option value="">Select a promotion name</option>
                            {promotions.map((promo) => (
                                <option key={promo.id} value={promo.id}>
                                    {promo.name || `Promotion #${promo.id}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <InputLabel text="Discount Type" />
                        <select name="type" value={formData.type} onChange={handleChange}
                                className="w-full px-4 py-3 input-theme border rounded-[16px] text-sm">
                            <option value="percent">Percentage (%)</option>
                            <option value="fixed">Fixed Amount ($)</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <InputLabel text="Discount" />
                        <input type="number" name="value" value={formData.value} onChange={handleChange}
                               className="w-full px-4 py-3 input-theme border rounded-[16px] text-sm"
                               placeholder="0" />
                    </div>
                    <div className="flex flex-col">
                        <InputLabel text="Min Order Amount" />
                        <input type="number" name="min_amount" value={formData.min_amount} onChange={handleChange}
                               className="w-full px-4 py-3 input-theme border rounded-[16px] text-sm"
                               placeholder="0" />
                    </div>
                    <div className="flex flex-col">
                        <InputLabel text="Max Discount" />
                        <input type="number" name="max_discount" value={formData.max_discount} onChange={handleChange}
                               className="w-full px-4 py-3 input-theme border rounded-[16px] text-sm"
                               placeholder="0" />
                    </div>

                    <div className="flex flex-col">
                        <InputLabel text="Start Date" />
                        <input type="date" name="start_date" value={formData.start_date} onChange={handleChange}
                               className="w-full px-4 py-3 input-theme border rounded-[16px] text-sm" />
                    </div>
                    <div className="flex flex-col">
                        <InputLabel text="End Date" />
                        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange}
                               className="w-full px-4 py-3 input-theme border rounded-[16px] text-sm" />
                    </div>

                    <div className="flex flex-col">
                        <InputLabel text="Usage Limit" />
                        <input type="number" name="usage_limit" value={formData.usage_limit} onChange={handleChange}
                               className="w-full px-4 py-3 input-theme border rounded-[16px] text-sm"
                               placeholder="0" />
                    </div>
                    <div className="flex flex-col">
                        <InputLabel text="Status" />
                        <select name="status" value={formData.status} onChange={handleChange}
                                className="w-full px-4 py-3 input-theme border rounded-[16px] text-sm">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col">
                    <InputLabel text="Description" />
                    <textarea name="description" value={formData.description} onChange={handleChange}
                              className="w-full px-4 py-3 input-theme border rounded-[16px] text-sm"
                              rows={3} placeholder="Optional description..." />
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 md:px-8 py-5 border-t shrink-0">
                <div className="flex items-center justify-end gap-3">
                    <button onClick={onClose}
                            className="px-6 py-3 text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors cursor-pointer">
                        Cancel
                    </button>
                    <button onClick={handleSubmit}
                            className="flex items-center gap-2 rounded-[20px] custom-main-color-button custom-main-color-button-hover px-4 sm:px-6 py-3 text-sm font-black text-white shadow-xl active:scale-95 cursor-pointer">
                        Create Coupon
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCoupon;