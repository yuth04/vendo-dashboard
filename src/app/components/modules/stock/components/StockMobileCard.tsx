"use client";

import React from 'react';
import { ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { ProductVariant } from "@/src/app/components/modules/stock/core/models/stockModel";

// Interface definitions matching the context signatures exactly
interface StockGroup {
    product: {
        id: number;
        productName: string;
        image?: string;
        category_id?: string | number;
        category?: { id: string | number };
    };
    totalStock: number;
    variants: ProductVariant[];
}

interface StockMobileCardProps {
    group: StockGroup;
    categoryMap: Record<string, string>;
    isExpanded: boolean;
    onToggleExpand: (id: number) => void;
    onOpenEdit: (variant: ProductVariant) => void;
    onDeleteVariant: (id: number) => void;
}

const StockMobileCard: React.FC<StockMobileCardProps> = ({
                                                             group,
                                                             categoryMap,
                                                             isExpanded,
                                                             onToggleExpand,
                                                             onOpenEdit,
                                                             onDeleteVariant
                                                         }) => {
    const catId = (group.product.category_id || group.product.category?.id)?.toString();

    return (
        <div className="card-theme rounded-2xl p-4 overflow-hidden shadow-sm border border-gray-50">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl card-theme p-1 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                    <img
                        src={group.product.image || '/placeholder.png'}
                        alt=""
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-400 truncate text-sm">{group.product.productName}</h3>
                    <p className="text-[10px] text-gray-400 font-medium">
                        {catId ? (categoryMap[catId] || 'General') : 'General'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => onToggleExpand(group.product.id)}
                    className="p-2 card-theme rounded-full hover:bg-gray-50 transition-all cursor-pointer"
                >
                    <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>

            <div className="flex justify-between items-center card-theme rounded-xl p-3 bg-gray-50/50">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Stock</p>
                    <p className="text-xl font-black text-[var(--header-text)]">{group.totalStock}</p>
                </div>
                <span className={`px-3 py-1 rounded-[20px] text-[9px] font-black border uppercase tracking-wider ${
                    group.totalStock <= 0 ? 'bg-red-50 text-red-500 border-red-100' :
                        group.totalStock <= 5 ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-cyan-50 text-cyan-500 border-cyan-100'
                }`}>
                    {group.totalStock <= 0 ? 'Out' : group.totalStock <= 5 ? 'Low' : 'In Stock'}
                </span>
            </div>

            {isExpanded && (
                <div className="mt-4 space-y-3 pt-4 border-t border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2">
                    {group.variants.map((variant) => (
                        <div
                            key={variant.id}
                            className="flex items-center justify-between p-3 rounded-xl card-theme border border-gray-50"
                        >
                            <div className="text-xs">
                                <p className="font-bold text-gray-400">{variant.color} / {variant.size}</p>
                                <p className="text-[10px] text-gray-300 font-medium">SKU-{variant.id}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-[var(--header-text)]">{variant.stock}</span>
                                <button
                                    type="button"
                                    onClick={() => onOpenEdit(variant)}
                                    className="p-2 custom-main-color-bg text-white rounded-lg shadow-sm cursor-pointer"
                                >
                                    <Edit2 size={12}/>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDeleteVariant(variant.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Item"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StockMobileCard;