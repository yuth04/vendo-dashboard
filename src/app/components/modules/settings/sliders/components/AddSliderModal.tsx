'use client';

import React, { useState, useRef } from "react";
import { X, Upload, Share2, Link as LinkIcon, Image as ImageIcon, Trash2, Plus } from "lucide-react";
import { useAlert } from "@/src/app/components/context/AlertContext";
import * as SliderService from "../core/services/sliderService";

interface AddSliderModalProps {
    isOpen: boolean;
    onClose: () => void;
    refreshData: () => void;
}

const AddSliderModal = ({ isOpen, onClose, refreshData }: AddSliderModalProps) => {
    const { showToast } = useAlert();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        imageFile: null as File | null,
        imagePreview: "",
        link: "",
        position: 0,
        status: true
    });

    if (!isOpen) return null;

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFormData({
            ...formData,
            imageFile: null,
            imagePreview: ""
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast("Image is too large. Max 2MB allowed.", "warning");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    imageFile: file,
                    imagePreview: reader.result as string
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            showToast("Title is required", "warning");
            return;
        }
        if (!formData.imageFile) {
            showToast("Please upload an image", "warning");
            return;
        }

        setLoading(true);

        try {
            const res = await SliderService.createSliderLogic(formData);

            if (!res.error) {
                showToast("Created Successfully", "success");
                refreshData();
                onClose();
            } else {
                showToast(res.error.message || "Validation Error (422)", "error");
            }
        } catch (err) {
            showToast("Network Error", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 backdrop-blur-md p-4">
            <div className="w-full max-w-[600px] rounded-[30px] md:rounded-[40px] card-theme shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80dvh] overflow-hidden">

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <div className="flex items-center justify-between border-b border-gray-50 p-6 md:p-8 shrink-0">
                    <div className="flex items-center gap-3 text-gray-900 font-black text-lg md:text-xl">
                        <Plus className="custom-main-color-icon w-5 h-5 md:w-6 md:h-6" strokeWidth={3}/>
                        <h2 className="text-lg md:text-2xl font-black text-[var(--header-text)]">New Slider</h2>
                    </div>
                    <button onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1">
                        <X size={24}/>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5 md:space-y-6 no-scrollbar">
                    <div>
                        <label
                            className="mb-3 flex items-center gap-2 text-[12px] sm:text-[14px] font-medium text-gray-500">
                            <ImageIcon size={14}/> Slider Image <span className="text-red-500">*</span>
                        </label>
                        <div
                            onClick={handleImageClick}
                            className="group relative flex h-40 md:h-56 w-full cursor-pointer flex-col items-center justify-center rounded-[24px] md:rounded-[32px] border-2 border-dashed border-gray-200 card-theme transition-all hover:border-cyan-400 hover:bg-white overflow-hidden"
                        >
                            {formData.imagePreview ? (
                                <>
                                    <img src={formData.imagePreview} className="h-full w-full object-cover" alt="Preview" />
                                    <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-white text-[10px] font-bold uppercase tracking-widest">Click to change</p>
                                            <button
                                                onClick={handleRemoveImage}
                                                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase transition-transform active:scale-95"
                                            >
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-6">
                                    <div className="mx-auto mb-3 flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl card-theme shadow-sm transition-transform group-hover:scale-110">
                                        <Upload className="custom-main-color-icon w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <p className="text-xs md:text-[13px] font-bold text-gray-400">Click to upload banner</p>
                                    <p className="mt-1 text-[9px] md:text-[10px] font-medium text-gray-400 uppercase tracking-tighter">Max size: 2MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                                <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full rounded-[15px] md:rounded-[20px] input-theme p-3.5 md:p-4 text-sm font-bold text-gray-900 outline-none transition-all"
                                placeholder="Title your slider..."
                            />
                        </div>

                        <div>
                                <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={2}
                                className="w-full rounded-[15px] md:rounded-[20px] input-theme p-3.5 md:p-4 text-sm font-bold text-gray-900 outline-none focus:border-cyan-400 resize-none transition-all"
                                placeholder="Description your slider..."
                            />
                        </div>

                        {/*<div>*/}
                        {/*    <label className="mb-2 flex items-center gap-2 text-[12px] sm:text-[14px] font-medium text-gray-500">*/}
                        {/*        <LinkIcon size={12}/> Destination Link*/}
                        {/*    </label>*/}
                        {/*    <input*/}
                        {/*        type="text"*/}
                        {/*        value={formData.link}*/}
                        {/*        onChange={(e) => setFormData({...formData, link: e.target.value})}*/}
                        {/*        className="w-full rounded-[15px] md:rounded-[20px] input-theme p-3.5 md:p-4 text-sm font-bold text-gray-900 outline-none focus:border-cyan-400 transition-all"*/}
                        {/*        placeholder="https://vendo.com/promo"*/}
                        {/*    />*/}
                        {/*</div>*/}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Display Order</label>
                                <input
                                    type="number"
                                    value={formData.position}
                                    onChange={(e) => setFormData({...formData, position: parseInt(e.target.value) || 0})}
                                    className="w-full rounded-[15px] md:rounded-[20px] input-theme p-3.5 md:p-4 text-sm font-bold text-gray-900 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Visibility</label>
                                <select
                                    value={formData.status ? "ACTIVE" : "INACTIVE"}
                                    onChange={(e) => setFormData({...formData, status: e.target.value === "ACTIVE"})}
                                    className="w-full rounded-[15px] md:rounded-[20px] input-theme p-3.5 md:p-4 text-sm font-bold text-gray-900 outline-none appearance-none cursor-pointer transition-all"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
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
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-[20px] custom-main-color-button custom-main-color-button-hover px-6 md:px-10 py-3 text-xs md:text-sm font-black text-white shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        <Share2 size={18} />
                        Create Slider
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddSliderModal;