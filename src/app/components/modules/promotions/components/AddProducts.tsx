"use client";

import React, { useState } from 'react';
import {X, Loader2, Package, PlusCircle, ChevronDown, ShoppingBag, Edit3} from 'lucide-react';
import { useAlert } from "@/src/app/components/context/AlertContext";
import {PromoProduct} from "@/src/app/components/modules/promotions/core/models/promotionModel";
import { promotionService } from "@/src/app/components/modules/promotions/core/services/promotionService";

interface AddProductsProps {
    onClose: () => void;
    onSuccess: () => void;
    categoryData?: any;
    allDiscounts?: any[];
    allProducts: PromoProduct[];
}

const AddProducts = ({ onClose, onSuccess, categoryData, allDiscounts = [], allProducts = [] }: AddProductsProps) => {
    const { showToast } = useAlert();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDiscountId, setSelectedDiscountId] = useState<string>(categoryData?.id?.toString() || "");

    // Fixed: Initialize state with already existing linked products instead of an empty array
    const [selectedProducts, setSelectedProducts] = useState<PromoProduct[]>(categoryData?.products || []);
    const [currentProductId, setCurrentProductId] = useState<string>("");

    const addProductToList = () => {
        if (!currentProductId) return;
        const product = allProducts.find(p => p.id.toString() === currentProductId);
        if (product) {
            if (!selectedProducts.find(p => p.id === product.id)) {
                setSelectedProducts([...selectedProducts, product]);
                setCurrentProductId("");
            } else {
                showToast("Product already added", "warning");
            }
        }
    };

    const removeProductFromList = (idToRemove: number) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== idToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDiscountId) return showToast("Select a Discount", "warning");
        if (selectedProducts.length === 0) return showToast("Add at least one Product", "warning");

        setIsSubmitting(true);
        try {
            const payload = {
                discount_id: selectedDiscountId,
                product_ids: selectedProducts.map(p => p.id)
            };

            const response = await promotionService.addProductsToDiscount(payload);

            if (!response.error) {
                showToast("Products linked successfully!", "success");
                onSuccess();
                onClose();
            } else {
                showToast(response.error.message || "Failed to link", "error");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
            showToast(errorMessage, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card-theme w-[95%] sm:w-[500px] rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[80dvh]">
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-50 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-teal-50 text-teal-500 rounded-[20px]">
                        <Edit3 className="custom-main-color-icon" size={24}/>
                    </div>
                    <div>
                        <h2 className="text-[18px] md:text-[22px] font-black text-[var(--header-text)] tracking-tight">Add
                            Products</h2>
                    </div>
                </div>
                <button onClick={onClose}
                        className="p-2.5 hover:bg-slate-50 rounded-full text-slate-300 transition-colors cursor-pointer">
                    <X size={22}/>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 px-8 py-6 space-y-6 overflow-y-auto no-scrollbar">

                    <div className="space-y-3">
                            <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Promotions Name*</label>
                        <div className="relative group">
                            <select
                                value={selectedDiscountId}
                                onChange={(e) => setSelectedDiscountId(e.target.value)}
                                className="w-full pl-5 pr-10 py-4 card-theme bg-slate-50 border-2 border-transparent focus:border-teal-100 focus:bg-white rounded-[24px] outline-none text-sm font-bold text-slate-700 appearance-none transition-all"
                            >
                                <option value="">Choose a discount...</option>
                                {allDiscounts?.map((promo) => (
                                    <option key={promo.id} value={promo.id.toString()}>
                                        {promo.name || `ID: ${promo.id}`}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    {/* Product Selection */}
                    <div className="space-y-3">
                            <label className="mb-2 block text-[12px] sm:text-[14px] font-medium text-gray-500">Select Product *</label>
                        <div className="flex gap-3">
                            <div className="relative flex-1 group">
                                <ShoppingBag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <select
                                    value={currentProductId}
                                    onChange={(e) => setCurrentProductId(e.target.value)}
                                    className="w-full pl-12 pr-10 py-4 card-theme focus:border-teal-100 focus:bg-white rounded-[24px] outline-none text-sm font-bold text-slate-700 appearance-none transition-all"
                                >
                                    <option value="">Choose product...</option>
                                    {allProducts && allProducts.length > 0 ? (
                                        allProducts.map((prod) => (
                                            <option key={prod.id} value={prod.id.toString()}>
                                                {prod.productName}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>Loading products...</option>
                                    )}
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                            </div>
                            <button
                                type="button"
                                onClick={addProductToList}
                                className="w-[60px] flex items-center justify-center bg-slate-900 text-white rounded-full hover:bg-teal-500 transition-all active:scale-95 shadow-lg cursor-pointer"
                            >
                                <PlusCircle size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Selected Badges with Images */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <span className=" text-[12px] sm:text-[14px] font-medium text-gray-500 tracking-tight">Selected ({selectedProducts.length})</span>
                            {selectedProducts.length > 0 && (
                                <button type="button" onClick={() => setSelectedProducts([])} className="text-[12px] font-bold text-red-400 hover:text-red-600 transition-colors">Clear All</button>
                            )}
                        </div>
                        <div className="min-h-[140px] p-5 card-theme rounded-[32px] border-2 border-dashed border-slate-100 flex flex-wrap gap-2 content-start">
                            {selectedProducts.length > 0 ? (
                                selectedProducts.map(product => (
                                    <div key={product.id} className="flex items-center gap-2 bg-white pl-2 pr-1 py-1 rounded-[18px] border border-slate-100 shadow-sm transition-all animate-in fade-in slide-in-from-top-1">
                                        <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Package size={12} className="text-slate-300" />
                                            )}
                                        </div>

                                        <span className="text-[12px] font-black text-slate-700 truncate max-w-[100px]">{product.productName}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeProductFromList(product.id)}
                                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors"
                                        >
                                            <X size={14}/>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center py-6 opacity-40">
                                    <Package size={32} strokeWidth={1} className="mb-2" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No Products</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-6 md:px-8 py-5 border-t shrink-0">
                    <div className="flex items-center justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors disabled:opacity-40 cursor-pointer">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedDiscountId || selectedProducts.length === 0}
                            className="flex items-center justify-center gap-2 px-4 py-3 custom-main-color-button custom-main-color-button-hover text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Submit to discounts"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddProducts;