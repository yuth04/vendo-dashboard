"use client";

import React from 'react';
import { CiImageOn } from "react-icons/ci";
import { Edit2, Trash2 } from "lucide-react";
import { HiCloudArrowUp } from "react-icons/hi2";
import { User } from '../core/models/accountIofoModel';

interface ProfilePictureUploadProps {
    user: User | null;
    userInitial: string;
    isImageSubmitting: boolean;
    selectedFile: File | null;
    previewUrl: string | null;
    croppedPreview: string | null;
    setShowCropper: (show: boolean) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveSelectedImage: () => void;
    handleImageUpload: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
                                                                       user,
                                                                       userInitial,
                                                                       isImageSubmitting,
                                                                       selectedFile,
                                                                       previewUrl,
                                                                       croppedPreview,
                                                                       setShowCropper,
                                                                       handleFileChange,
                                                                       handleRemoveSelectedImage,
                                                                       handleImageUpload,
                                                                       fileInputRef
                                                                   }) => {
    return (
        <section className="card-theme p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="pb-4 sm:pb-6 flex items-center gap-3 sm:gap-4 self-start">
                <CiImageOn className="w-5 h-5 sm:w-6 sm:h-6 custom-main-color-icon"/>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--header-text)]">Profile Picture</h3>
            </div>

            <div className="relative mb-6 group">
                <div className="relative">
                    {(croppedPreview || user?.image) ? (
                        <img
                            src={croppedPreview || user?.image}
                            alt="Profile"
                            className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-xl"
                        />
                    ) : (
                        <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl custom-main-color-bg flex items-center justify-center text-gray-800 text-5xl font-bold">
                            {userInitial}
                        </div>
                    )}

                    {previewUrl && (
                        <div className="absolute bottom-1 right-1 flex gap-2">
                            <button
                                onClick={() => setShowCropper(true)}
                                className="p-2 bg-[#8ABEB9] text-white rounded-full shadow-lg hover:bg-[#7aa9a4] transition-all cursor-pointer"
                                title="Edit Crop"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button
                                onClick={handleRemoveSelectedImage}
                                className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all cursor-pointer"
                                title="Cancel Image"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full space-y-4">
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-6 transition-colors cursor-pointer group flex flex-col items-center"
                >
                    <HiCloudArrowUp className="w-10 h-10 text-gray-300 group-hover:text-[#8ABEB9] mb-2"/>
                    <span className="text-xs text-gray-500 truncate max-w-[90%]">
                        {selectedFile ? selectedFile.name : "Click to upload"}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 font-medium">
                        200 × 200 | Max 5MB
                    </span>
                </div>
                <button
                    onClick={handleImageUpload}
                    disabled={!selectedFile || isImageSubmitting}
                    className="w-full custom-main-color-button text-white py-3 rounded-[20px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-lg"
                >
                    {isImageSubmitting ? "Uploading..." : "Save Photo"}
                </button>
            </div>
        </section>
    );
};

export default ProfilePictureUpload;