"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, User, Settings, PencilLine, Loader2, ChevronDown, Camera, Edit2, Trash2 } from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import Cropper from 'react-easy-crop';
import { StaffService } from "@/src/app/components/modules/staff/core/services/StaffService";


const EditStaff = ({ isOpen, onClose, user, onSuccess }: any) => {
    const { showToast } = useAlert();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);


    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [tempUrl, setTempUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        role: ""
    });

    //--- ACTIVE WORKER ROLE DETECTION SETUP ---//
    const currentUserRole = (() => {
        if (typeof window === 'undefined') return null;
        try {
            const raw = localStorage.getItem('auth_user');
            return raw ? JSON.parse(raw)?.role ?? null : null;
        } catch {
            return null;
        }
    })();

    const isSuperAdmin = currentUserRole === 'super-admin';
    const isAdmin = currentUserRole === 'admin';

    // Core Authorization Strategy Rule Flags
    const canUploadImage = isSuperAdmin;
    const canModifyFields = isSuperAdmin;

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
                role: user.role || ""
            });
            setPreviewImage(user.image || "");
            setSelectedFile(null);
            setTempUrl(null);
        }
    }, [user]);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createCroppedImage = async (imageSrc: string, pixelCrop: any): Promise<{file: File, url: string} | null> => {
        const image = new Image();
        image.src = imageSrc;
        await new Promise((resolve) => (image.onload = resolve));

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) return resolve(null);
                const file = new File([blob], "admin-avatar.jpg", { type: "image/jpeg" });
                const url = URL.createObjectURL(blob);
                resolve({ file, url });
            }, 'image/jpeg', 0.9);
        });
    };

    const handleApplyCrop = async () => {
        if (tempUrl && croppedAreaPixels) {
            const result = await createCroppedImage(tempUrl, croppedAreaPixels);
            if (result) {
                setSelectedFile(result.file);
                setPreviewImage(result.url);
                setShowCropper(false);
            }
        }
    };

    const handleCancelCrop = () => {
        setShowCropper(false);
        if (!selectedFile) {
            setTempUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canUploadImage) return;
        setSelectedFile(null);
        setTempUrl(null);
        setPreviewImage(user.image || "");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    if (!isOpen || !user) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canUploadImage) return;
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setTempUrl(url);
            setShowCropper(true);
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            data.append("first_name", formData.first_name);
            data.append("last_name", formData.last_name);
            data.append("email", formData.email);
            data.append("role", formData.role);

            if (selectedFile && canUploadImage) {
                data.append("image", selectedFile);
            }

            await StaffService.updateAdmin(user.id, data);

            if (formData.role !== user.role && StaffService.hasRoleUpdateMethod()) {
                await StaffService.updateAdminRole(user.id, formData.role);
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Update failed:", error);
            showToast(error?.response?.data?.message || "Failed to update user.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">

            {/* CROP MODAL */}
            {showCropper && tempUrl && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="card-theme rounded-[24px] sm:rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl my-auto">
                        <div className="p-4 sm:p-6 flex justify-between items-center border-b border-gray-100">
                            <h3 className="font-black text-[var(--header-text)] text-sm sm:text-base">Crop Image</h3>
                            <button
                                onClick={handleCancelCrop}
                                className="card-theme p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X size={18}/>
                            </button>
                        </div>

                        <div className="relative h-[280px] xs:h-[320px] sm:h-[400px] w-full bg-gray-900">
                            <Cropper
                                image={tempUrl}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>

                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] sm:text-xs font-bold text-gray-400 uppercase">
                                    <span>Zoom Level</span>
                                    <span>{Math.round(zoom * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8ABEB9]"
                                />
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-50 pt-4 sm:pt-6">
                                <button
                                    onClick={handleCancelCrop}
                                    className="px-5 md:px-6 py-2.5 text-[10px] md:text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApplyCrop}
                                    className="flex items-center justify-center gap-2 rounded-[20px] custom-main-color-button custom-main-color-button-hover px-6 md:px-10 py-2.5 text-xs md:text-sm font-black text-white shadow-xl active:scale-95 transition-all cursor-pointer"
                                >
                                    Apply Crop
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-[650px] card-theme rounded-[30px] md:rounded-[45px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[80dvh]">

                <div className="flex items-center justify-between p-6 md:p-8 pb-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 custom-main-color-card rounded-full text-white">
                            <PencilLine className="custom-main-color-icon w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-lg md:text-xl font-black text-[var(--header-text)]">Edit Staff</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all cursor-pointer">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 p-6 md:p-8 py-0 space-y-6 overflow-y-auto no-scrollbar">
                    <div className="flex justify-center py-2">
                        <div className="relative group">
                            <div
                                className={`w-28 h-28 md:w-32 md:h-32 rounded-[30px] md:rounded-[35px] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center transition-all ${
                                    canUploadImage ? 'group-hover:border-blue-400 cursor-pointer' : 'opacity-65 cursor-not-allowed disabled:cursor-not-allowed'
                                }`}
                                onClick={() => canUploadImage && fileInputRef.current?.click()}
                            >
                                {previewImage ? (
                                    <img src={previewImage} className="w-full h-full object-cover" alt="Profile" />
                                ) : (
                                    <User size={40} className="text-slate-300" />
                                )}
                            </div>

                            {selectedFile ? (
                                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 flex gap-1.5">
                                    <button
                                        disabled={!canUploadImage}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (canUploadImage) setShowCropper(true);
                                        }}
                                        className={`p-2 bg-[#8ABEB9] text-white rounded-xl shadow-lg border-2 border-white transition-all ${
                                            !canUploadImage ? 'opacity-40 cursor-not-allowed disabled:cursor-not-allowed' : 'hover:bg-[#7aa9a4] cursor-pointer'
                                        }`}
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        disabled={!canUploadImage}
                                        onClick={handleRemoveImage}
                                        className={`p-2 bg-red-500 text-white rounded-xl shadow-lg border-2 border-white transition-all ${
                                            !canUploadImage ? 'opacity-40 cursor-not-allowed disabled:cursor-not-allowed' : 'hover:bg-red-600 cursor-pointer'
                                        }`}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className={`absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 p-2 text-white rounded-xl shadow-lg border-4 border-white transition-all ${
                                        canUploadImage ? 'custom-main-color-bg group-hover:scale-110 cursor-pointer' : 'bg-gray-300 opacity-50 cursor-not-allowed disabled:cursor-not-allowed'
                                    }`}
                                    onClick={() => canUploadImage && fileInputRef.current?.click()}
                                >
                                    <Camera className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                                accept="image/*"
                                disabled={!canUploadImage}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        {/* First Name input layout block */}
                        <div className="space-y-1 md:space-y-2">
                            <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">First Name</label>
                            <input
                                type="text"
                                value={formData.first_name}
                                disabled={!canModifyFields}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className={`w-full input-theme rounded-[15px] md:rounded-[20px] py-3.5 md:py-4 px-4 text-[13px] md:text-[14px] font-bold outline-none transition-all ${
                                    !canModifyFields ? 'bg-gray-100/60 text-slate-400 cursor-not-allowed disabled:cursor-not-allowed' : 'text-slate-600 focus:border-blue-400'
                                }`}
                            />
                        </div>

                        {/* Last Name input layout block */}
                        <div className="space-y-1 md:space-y-2">
                            <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Last Name</label>
                            <input
                                type="text"
                                value={formData.last_name}
                                disabled={!canModifyFields}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                className={`w-full input-theme rounded-[15px] md:rounded-[20px] py-3.5 md:py-4 px-4 text-[13px] md:text-[14px] font-bold outline-none transition-all ${
                                    !canModifyFields ? 'bg-gray-100/60 text-slate-400 cursor-not-allowed disabled:cursor-not-allowed' : 'text-slate-600 focus:border-blue-400'
                                }`}
                            />
                        </div>

                        {/* Email Address block */}
                        <div className="md:col-span-2 space-y-1 md:space-y-2">
                            <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled={!canModifyFields}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`w-full input-theme rounded-[15px] md:rounded-[20px] py-3.5 md:py-4 px-4 text-[13px] md:text-[14px] font-bold outline-none transition-all ${
                                    !canModifyFields ? 'bg-gray-100/60 text-slate-400 cursor-not-allowed disabled:cursor-not-allowed' : 'text-slate-600 focus:border-blue-400'
                                }`}
                            />
                        </div>

                        {/* User Role dropdown selector block */}
                        <div className="md:col-span-2 space-y-1 md:space-y-2">
                            <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">User Role</label>
                            <div className="relative">
                                <Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4.5 h-4.5" />
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full appearance-none input-theme rounded-[15px] md:rounded-[20px] py-3.5 md:py-4 pl-12 pr-10 text-[13px] md:text-[14px] font-bold text-slate-600 focus:bg-white focus:border-blue-400 cursor-pointer transition-all outline-none"
                                >
                                    <option value="staff">staff</option>
                                    {isSuperAdmin && <option value="super-admin">super-admin</option>}
                                    <option value="admin">admin</option>
                                    <option value="customer">customer</option>
                                </select>
                                <ChevronDown
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none w-4.5 h-4.5"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 p-6 md:p-8 shrink-0">
                    <button onClick={onClose} className="px-5 md:px-6 py-3 text-[10px] md:text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors disabled:opacity-40 cursor-pointer">
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-[20px] custom-main-color-button custom-main-color-button-hover px-6 md:px-10 py-3 text-xs md:text-sm font-black text-white shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditStaff;