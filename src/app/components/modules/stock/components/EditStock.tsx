"use client";

import React, { useEffect, useState } from 'react';
import {X, Save, Loader2, PencilLine} from 'lucide-react';
import {stockService} from "@/src/app/components/modules/stock/core/services/stockService";
import {ProductVariant} from "@/src/app/components/modules/stock/core/models/stockModel";


interface EditStockProps {
    isOpen: boolean;
    onClose: () => void;
    variant: ProductVariant | null;
    onSave: (variantId: number, newStock: number) => Promise<void>;
    isUpdating: boolean;
}

const EditStock = ({ isOpen, onClose, variant, onSave, isUpdating }: EditStockProps) => {
    const [stockValue, setStockValue] = useState<number | string>("");

    useEffect(() => {
        if (variant) {
            setStockValue(variant.stock);
        }
    }, [variant, isOpen]);

    if (!isOpen || !variant) return null;

    const variantImg = variant.images?.find(img => img.is_primary)?.image || variant.product.image;

    const handleSave = () => {
        const numericStock = stockService.validateStockInput(stockValue);
        if (numericStock !== null) {
            onSave(variant.id, numericStock);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="card-theme w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center px-6 md:px-8 py-5 md:py-6 border-b border-gray-50">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2.5 md:p-3 custom-main-color-card rounded-full text-white">
                            <PencilLine className="custom-main-color-icon w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5}/>
                        </div>
                        <h2 className="text-lg md:text-xl font-bold text-[var(--header-text)]">Update Stock</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 cursor-pointer"
                    >
                        <X size={20}/>
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    {/* Product Info Card */}
                    <div className="flex items-start md:items-center gap-4 md:gap-5 p-4 md:p-5 card-theme rounded-3xl mb-6 md:mb-8">
                        <div
                            className="w-16 h-16 md:w-20 md:h-20 shrink-0 card-theme rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden p-2 shadow-sm">
                            <img src={variantImg || '/placeholder.png'} alt="" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                            <h3 className="font-bold text-gray-400 text-base md:text-lg leading-tight truncate">{variant.product.productName}</h3>
                            <p className="text-xs md:text-sm text-gray-500 italic">
                                Color: <span className="font-semibold text-gray-400">{variant.color}</span>,
                                Size: <span className="font-semibold text-gray-400">{variant.size}</span>
                            </p>
                        </div>
                    </div>

                    {/* Stock Input Area */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-400 ml-1">Stock Quantity</label>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative w-full sm:flex-1">
                                <input
                                    type="number"
                                    value={stockValue}
                                    onChange={(e) => setStockValue(e.target.value)}
                                    className="w-full px-6 py-4 md:py-5 card-theme rounded-[22px] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-center text-xl font-bold transition-all"
                                    placeholder="0"
                                    autoFocus
                                />
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0 pr-0 sm:pr-4">
                                <p className="text-[12px] md:text-[14px] font-bold text-gray-400 tracking-widest">Current:</p>
                                <p className="text-xl md:text-2xl font-black text-gray-400">{variant.stock}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 px-6 md:px-8 py-5 md:py-6 ">
                    <button
                        onClick={onClose}
                        className="px-4 md:px-6 py-3 text-[10px] md:text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="flex items-center justify-center gap-2 rounded-[20px] custom-main-color-button custom-main-color-button-hover px-5 md:px-10 py-3 text-[10px] md:text-[12px] lg:text-sm font-black text-white shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditStock;