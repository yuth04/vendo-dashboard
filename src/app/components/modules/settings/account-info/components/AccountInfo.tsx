"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { EyeIcon, EyeOffIcon, UserCircleIcon, UserCog } from "lucide-react";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { PiLockKeyOpenThin } from "react-icons/pi";
import { accountIofoService } from '../core/services/accountIofoService';
import { User } from '../core/models/accountIofoModel';
import ProfilePictureUpload from './ProfilePictureUpload';
import ProfileImageCropperModal from './ProfileImageCropperModal';
import {authClient} from "@/src/app/components/modules/auth/core/api/authClient";


const AccountInfo = () => {
    const { showToast } = useAlert();
    const [user, setUser] = useState<User | null>(null);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPassSubmitting, setIsPassSubmitting] = useState(false);
    const [isImageSubmitting, setIsImageSubmitting] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: ""
    });

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: ""
    });

    const isProfileDisabled =
        !formData.first_name.trim() ||
        !formData.last_name.trim() ||
        (formData.first_name === user?.first_name && formData.last_name === user?.last_name);

    const isPasswordDisabled =
        !passwordData.current_password ||
        !passwordData.new_password ||
        !passwordData.new_password_confirmation;

    const userInitial = (formData.first_name || formData.email || "?").charAt(0).toUpperCase();

    useEffect(() => {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setFormData({
                    first_name: parsedUser.first_name || "",
                    last_name: parsedUser.last_name || "",
                    email: parsedUser.email || ""
                });
            } catch (error) {
                console.error("Failed to parse user", error);
            }
        }

        authClient.getProfile().then((profile) => {
            if (profile) {
                setUser(profile);
                setFormData({
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    email: profile.email
                });
            }
        });
    }, []);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const MAX_SIZE = 5 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                showToast("File size must be less than 5MB", "error");
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setPreviewUrl(reader.result as string);
                setShowCropper(true);
            };
        }
    };

    const handleRemoveSelectedImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setCroppedPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

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
                const file = new File([blob], "cropped-avatar.jpg", { type: "image/jpeg" });
                const url = URL.createObjectURL(blob);
                resolve({ file, url });
            }, 'image/jpeg');
        });
    };

    const handleApplyCrop = async () => {
        if (previewUrl && croppedAreaPixels) {
            const result = await createCroppedImage(previewUrl, croppedAreaPixels);
            if (result) {
                setSelectedFile(result.file);
                setCroppedPreview(result.url);
                setShowCropper(false);
            }
        }
    };

    const handleImageUpload = async () => {
        if (!selectedFile || isImageSubmitting) return;
        setIsImageSubmitting(true);

        const result = await accountIofoService.uploadProfilePicture(selectedFile, croppedPreview, user);

        if (!result.success) {
            showToast(result.error || "Failed to upload image", "error");
        } else {
            showToast("Profile picture updated successfully!", "success");
            setUser(result.updatedUser);
            handleRemoveSelectedImage();
        }
        setIsImageSubmitting(false);
    };

    const handleSaveProfile = async () => {
        if (isSubmitting || isProfileDisabled) return;
        setIsSubmitting(true);

        const result = await accountIofoService.updateProfileName(formData.first_name, formData.last_name, user);

        if (!result.success) {
            showToast(result.error || "Failed to update profile", "error");
        } else {
            setUser(result.updatedUser);
            showToast("Profile updated successfully!", "success");
        }
        setIsSubmitting(false);
    };

    const handleChangePassword = async () => {
        if (isPassSubmitting || isPasswordDisabled) return;

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            showToast("New passwords do not match", "error");
            return;
        }

        setIsPassSubmitting(true);
        const result = await accountIofoService.updatePassword(passwordData);

        if (!result.success) {
            showToast(result.error || "Failed to change password", "error");
        } else {
            showToast("Password changed successfully!", "success");
            setPasswordData({
                current_password: "",
                new_password: "",
                new_password_confirmation: ""
            });
        }
        setIsPassSubmitting(false);
    };

    return (
        <div className="min-h-screen p-4 sm:p-8">
            {/* CLEAN CONTEXT-SPECIFIC CROP MODAL */}
            <ProfileImageCropperModal
                showCropper={showCropper}
                previewUrl={previewUrl}
                crop={crop}
                zoom={zoom}
                setCrop={setCrop}
                setZoom={setZoom}
                onCropComplete={onCropComplete}
                setShowCropper={setShowCropper}
                handleApplyCrop={handleApplyCrop}
            />

            <div className="w-full max-w-4xl space-y-10">
                <header className=" pb-4 sm:pb-6 flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full custom-main-color-card custom-main-color-text">
                        <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6"/>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <h1 className="text-lg sm:text-2xl font-bold text-[var(--header-text)]">Account Settings</h1>
                        <p className="text-xs sm:text-sm text-gray-500">Manage your public profile and security preferences.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        <section className="card-theme p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="pb-4 sm:pb-6 flex items-center gap-3 sm:gap-4">
                                <UserCog className="w-5 h-5 sm:w-6 sm:h-6 custom-main-color-icon"/>
                                <h3 className="text-base sm:text-lg font-semibold text-[var(--header-text)]">Personal Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-400">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                        className="input-theme rounded-[20px] p-3 focus:ring-2 focus:ring-[#E2DF82] outline-none transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-400">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                        className="input-theme rounded-[20px] p-3 focus:ring-2 focus:ring-[#E2DF82] outline-none transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-400">Email Address</label>
                                    <input
                                        type="email"
                                        disabled
                                        value={formData.email}
                                        className="input-theme rounded-[20px] p-3 text-gray-400 cursor-not-allowed outline-none"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSubmitting || isProfileDisabled}
                                className="mt-6 custom-main-color-button text-white px-6 py-3 rounded-[20px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                            >
                                {isSubmitting ? "Update..." : "Update Name"}
                            </button>
                        </section>

                        <section className="card-theme p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="pb-4 sm:pb-6 flex items-center gap-3 sm:gap-4">
                                <PiLockKeyOpenThin className="w-5 h-5 sm:w-6 sm:h-6 custom-main-color-icon"/>
                                <h3 className="text-base sm:text-lg font-semibold text-[var(--header-text)]">Change Password</h3>
                            </div>
                            <div className="space-y-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-400">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                            className="input-theme rounded-[20px] p-3 w-full focus:ring-2 focus:ring-[#E2DF82] outline-none transition-all"
                                        />
                                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showCurrentPassword ? <EyeIcon size={20}/> : <EyeOffIcon size={20}/>}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-gray-400">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordData.new_password}
                                                onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                                className="input-theme rounded-[20px] p-3 w-full focus:ring-2 focus:ring-[#E2DF82] outline-none transition-all"
                                            />
                                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                {showNewPassword ? <EyeIcon size={20}/> : <EyeOffIcon size={20}/>}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-gray-400">Confirm New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwordData.new_password_confirmation}
                                                onChange={(e) => setPasswordData({...passwordData, new_password_confirmation: e.target.value})}
                                                className="input-theme rounded-[20px] p-3 w-full focus:ring-2 focus:ring-[#E2DF82] outline-none transition-all"
                                            />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                {showConfirmPassword ? <EyeIcon size={20}/> : <EyeOffIcon size={20}/>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleChangePassword}
                                disabled={isPassSubmitting || isPasswordDisabled}
                                className="mt-6 custom-main-color-button text-white px-6 py-3 rounded-[20px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isPassSubmitting ? "Updating..." : "Update Password"}
                            </button>
                        </section>
                    </div>

                    <div className="lg:col-span-1">
                        <ProfilePictureUpload
                            user={user}
                            userInitial={userInitial}
                            isImageSubmitting={isImageSubmitting}
                            selectedFile={selectedFile}
                            previewUrl={previewUrl}
                            croppedPreview={croppedPreview}
                            setShowCropper={setShowCropper}
                            handleFileChange={handleFileChange}
                            handleRemoveSelectedImage={handleRemoveSelectedImage}
                            handleImageUpload={handleImageUpload}
                            fileInputRef={fileInputRef}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountInfo;