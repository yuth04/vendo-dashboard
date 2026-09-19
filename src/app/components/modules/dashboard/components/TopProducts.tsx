import React from 'react';
import { TrendingUp } from 'lucide-react';
import {BsDatabaseSlash} from "react-icons/bs";
import {TopProduct} from "@/src/app/components/modules/dashboard/core/models/dashboardModel";

interface Props {
    data?: TopProduct[];
    loading?: boolean;
}

const TopProducts: React.FC<Props> = ({ data = [], loading }) => {
    const maxSold = Math.max(...data.map(p => p.total_sold), 1);

    return (
        <div className="card-theme p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <h3 className="font-bold mb-6 flex items-center gap-2 custom-main-color-icon text-sm">
                <TrendingUp size={18} strokeWidth={2.5} />
                <span className="text-[var(--header-text)] text-[20px] sm:text-[20px]">Top Products</span>
            </h3>

            {!loading && data.length === 0 ? (
                <div
                    className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-300 text-sm font-bold">
                    <BsDatabaseSlash className="w-10 h-10 text-gray-300"/>
                    <span>No data</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {data.map((product, index) => (
                        <div key={product.id} className="space-y-2 group cursor-default">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="w-5 h-5 rounded-full custom-main-color-button text-white flex items-center justify-center font-black text-[9px] shadow-sm group-hover:scale-110 transition-transform">
                                        {index + 1}
                                    </span>
                                    <span className="font-bold text-gray-400 text-xs tracking-tight">{product.productName}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    {product.total_sold} sold
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="custom-main-color-bg h-full rounded-full transition-all duration-700 ease-out group-hover:bg-cyan-500"
                                    style={{ width: `${(product.total_sold / maxSold) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TopProducts;