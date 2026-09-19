"use client";

import React from 'react';
import { X } from "lucide-react";
import Cropper from 'react-easy-crop';

interface ProfileImageCropperModalProps {
    showCropper: boolean;
    previewUrl: string | null;
    crop: { x: number; y: number };
    zoom: number;
    setCrop: (crop: { x: number; y: number }) => void;
    setZoom: (zoom: number) => void;
    onCropComplete: (_croppedArea: any, croppedAreaPixels: any) => void;
    setShowCropper: (show: boolean) => void;
    handleApplyCrop: () => void;
}

const ProfileImageCropperModal: React.FC<ProfileImageCropperModalProps> = ({
                                                                               showCropper,
                                                                               previewUrl,
                                                                               crop,
                                                                               zoom,
                                                                               setCrop,
                                                                               setZoom,
                                                                               onCropComplete,
                                                                               setShowCropper,
                                                                               handleApplyCrop
                                                                           }) => {
    if (!showCropper || !previewUrl) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div
                className="card-theme rounded-[24px] sm:rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl my-auto">
                <div className="p-4 sm:p-6 flex justify-between items-center border-b border-gray-100">
                    <h3 className="font-black text-[var(--header-text)] text-sm sm:text-base">Crop Images</h3>
                    <button
                        onClick={() => setShowCropper(false)}
                        className="card-theme p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    >
                        <X size={18}/>
                    </button>
                </div>

                <div className="relative h-[280px] xs:h-[320px] sm:h-[400px] w-full bg-gray-900">
                    <Cropper
                        image={previewUrl}
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
                        <div
                            className="flex justify-between text-[10px] sm:text-xs font-bold text-gray-400 uppercase">
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
                            onClick={() => setShowCropper(false)}
                            className="px-5 md:px-6 py-3 text-[10px] md:text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApplyCrop}
                            className="flex items-center justify-center gap-2 rounded-[20px] custom-main-color-button custom-main-color-button-hover px-6 md:px-10 py-3 text-xs md:text-sm font-black text-white shadow-xl active:scale-95 transition-all cursor-pointer"
                        >
                            Apply Crop
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileImageCropperModal;