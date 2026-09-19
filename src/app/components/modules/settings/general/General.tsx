'use client';

import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";

const BrandingSettings = () => {
    const { showToast } = useAlert();

    const [themeColor, setThemeColor] = useState('#8ABEB9');
    const [bgColor, setBgColor] = useState('#B7E5CD');
    const [buttonColor, setButtonColor] = useState('#8ABEB9');
    const [buttonHoverColor, setButtonHoverColor] = useState('#B7E5CD');

    useEffect(() => {
        const rootStyle = document.documentElement.style;

        const savedColor = localStorage.getItem('theme-primary-color');
        if (savedColor) {
            setThemeColor(savedColor);
            rootStyle.setProperty('--main-text', savedColor);
            rootStyle.setProperty('--main-icon', savedColor);
            rootStyle.setProperty('--main-hover-text', savedColor);
            rootStyle.setProperty('--main-hover-border', savedColor);
            rootStyle.setProperty('--main-color-border', savedColor);
            rootStyle.setProperty('--main-border-color-card', savedColor);
        }

        const savedBg = localStorage.getItem('theme-bg-color');
        if (savedBg) {
            setBgColor(savedBg);
            rootStyle.setProperty('--main-bg', savedBg);
        }

        const savedButton = localStorage.getItem('theme-button-color');
        if (savedButton) {
            setButtonColor(savedButton);
            rootStyle.setProperty('--main-button', savedButton);
        }

        const savedButtonHover = localStorage.getItem('theme-button-hover-color');
        if (savedButtonHover) {
            setButtonHoverColor(savedButtonHover);
            rootStyle.setProperty('--main-hover-button', savedButtonHover);
        }
    }, []);

    const handleColorChange = (newColor: string) => {
        setThemeColor(newColor);
        const rootStyle = document.documentElement.style;
        rootStyle.setProperty('--main-text', newColor);
        rootStyle.setProperty('--main-icon', newColor);
        rootStyle.setProperty('--main-hover-text', newColor);
        rootStyle.setProperty('--main-hover-border', newColor);
        rootStyle.setProperty('--main-color-border', newColor);
        rootStyle.setProperty('--main-border-color-card', newColor);
    };

    const handleBgChange = (newBg: string) => {
        setBgColor(newBg);
        document.documentElement.style.setProperty('--main-bg', newBg);
    };

    const handleButtonChange = (newButtonColor: string) => {
        setButtonColor(newButtonColor);
        document.documentElement.style.setProperty('--main-button', newButtonColor);
    };

    const handleButtonHoverChange = (newHoverColor: string) => {
        setButtonHoverColor(newHoverColor);
        document.documentElement.style.setProperty('--main-hover-button', newHoverColor);
    };

    const handleSaveSettings = async () => {
        try {
            localStorage.setItem('theme-primary-color', themeColor);
            localStorage.setItem('theme-bg-color', bgColor);
            localStorage.setItem('theme-button-color', buttonColor);
            localStorage.setItem('theme-button-hover-color', buttonHoverColor);
            showToast("Branding themes updated successfully!", "success");
        } catch (error) {
            showToast("Failed to save configuration styles.", "error");
        }
    };

    const noZoomStyle: React.CSSProperties = {
        fontSize: '16px',
        touchAction: 'manipulation',
    };

    const textInputClass =
        "w-full px-4 py-3 input-theme rounded-2xl outline-none focus:ring-2 focus:ring-gray-100 font-medium text-gray-700";

    const colorInputClass =
        "absolute inset-0 w-full h-full p-0 border-none cursor-pointer scale-150";

    return (
        <div className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto flex flex-col gap-6">

            {/* MAIN HEADER TITLE */}
            <header className="pb-4 sm:pb-6 flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full custom-main-color-card custom-main-color-text">
                    <Palette className="w-5 h-5 sm:w-6 sm:h-6"/>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <h1 className="text-lg sm:text-2xl font-bold text-[var(--header-text)]">Branding Management</h1>
                </div>
            </header>

            {/* 2 ROW GRID DISPLAY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* CARD 1: MAIN TEXT COLOR */}
                <div className="card-theme p-6 rounded-3xl border border-gray-100 shadow-sm bg-white">
                    <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">
                        Theme Main Text Color
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                            <input
                                type="color"
                                value={themeColor}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className={colorInputClass}
                                style={noZoomStyle}
                            />
                        </div>
                        <input
                            type="text"
                            value={themeColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                            placeholder="#000000"
                            className={textInputClass}
                            style={noZoomStyle}
                        />
                    </div>
                </div>

                {/* CARD 2: MAIN BACKGROUND COLOR */}
                <div className="card-theme p-6 rounded-3xl border border-gray-100 shadow-sm bg-white">
                    <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">
                        Theme Main Backgrounds Color
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                            <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => handleBgChange(e.target.value)}
                                className={colorInputClass}
                                style={noZoomStyle}
                            />
                        </div>
                        <input
                            type="text"
                            value={bgColor}
                            onChange={(e) => handleBgChange(e.target.value)}
                            placeholder="#000000"
                            className={textInputClass}
                            style={noZoomStyle}
                        />
                    </div>
                </div>

                {/* CARD 3: BUTTON BACKGROUND COLOR */}
                <div className="card-theme p-6 rounded-3xl border border-gray-100 shadow-sm bg-white">
                    <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">
                        Theme Main Button Background Color
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                            <input
                                type="color"
                                value={buttonColor}
                                onChange={(e) => handleButtonChange(e.target.value)}
                                className={colorInputClass}
                                style={noZoomStyle}
                            />
                        </div>
                        <input
                            type="text"
                            value={buttonColor}
                            onChange={(e) => handleButtonChange(e.target.value)}
                            placeholder="#000000"
                            className={textInputClass}
                            style={noZoomStyle}
                        />
                    </div>
                </div>

                {/* CARD 4: BUTTON HOVER BACKGROUND COLOR */}
                <div className="card-theme p-6 rounded-3xl border border-gray-100 shadow-sm bg-white">
                    <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">
                        Theme Main Button Background Hover Color
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                            <input
                                type="color"
                                value={buttonHoverColor}
                                onChange={(e) => handleButtonHoverChange(e.target.value)}
                                className={colorInputClass}
                                style={noZoomStyle}
                            />
                        </div>
                        <input
                            type="text"
                            value={buttonHoverColor}
                            onChange={(e) => handleButtonHoverChange(e.target.value)}
                            placeholder="#000000"
                            className={textInputClass}
                            style={noZoomStyle}
                        />
                    </div>
                </div>

            </div>

            {/* INFO MESSAGE & SAVE ACTION BLOCK */}
            <div>
                <div className="card-theme rounded-2xl p-4 flex gap-3 items-start mb-4">
                    <div className="text-gray-400 text-sm pt-0.5">ⓘ</div>
                    <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                        This will update the typography colors, layout view backgrounds, and primary click/hover buttons
                        across all modules.
                    </p>
                </div>
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleSaveSettings}
                        className="px-6 py-3 text-white text-sm font-bold rounded-[20px] transition-all shadow-md cursor-pointer custom-main-color-button custom-main-color-button-hover"
                    >
                        Save Changes
                    </button>
                </div>
            </div>

        </div>
    );
};

export default BrandingSettings;