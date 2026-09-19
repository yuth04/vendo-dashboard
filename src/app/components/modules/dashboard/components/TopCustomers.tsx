import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {TopCustomer} from "@/src/app/components/modules/dashboard/core/models/dashboardModel";

interface Props {
    data?: TopCustomer[];
    loading?: boolean;
}

const BG_COLORS = ['bg-indigo-600', 'bg-purple-600', 'bg-emerald-600', 'bg-orange-500', 'bg-rose-500'];

const TopCustomers: React.FC<Props> = ({ data = [], loading }) => {

    const [brokenImages, setBrokenImages] = useState<Record<number | string, boolean>>({});

    return (
        <div className="card-theme p-6 rounded-[2rem] border border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[var(--header-text)] text-[20px] font-bold sm:text-[20px]">Top Customers</h3>
                {loading && <Loader2 size={14} className="animate-spin custom-main-color-icon" />}
            </div>

            {!loading && data.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No data</p>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {data.map((c, i) => {
                        const keyId = c.id || i;
                        const firstInitial = c.first_name ? c.first_name.charAt(0) : '';
                        const lastInitial = c.last_name ? c.last_name.charAt(0) : '';
                        const initials = `${firstInitial}${lastInitial}`.toUpperCase() || '?';

                        return (
                            <div key={keyId} className="flex flex-col items-center text-center p-4 rounded-[2rem] card-theme  transition-all hover:bg-white hover:shadow-md group">

                                <div className="w-14 h-14 rounded-full mb-3 shadow-md border-2 border-white ring-1 ring-slate-100 overflow-hidden group-hover:scale-110 transition-transform flex items-center justify-center">
                                    {c.image && !brokenImages[keyId] ? (
                                        <img
                                            src={c.image}
                                            alt={`${c.first_name || ''} ${c.last_name || ''}`}
                                            className="w-full h-full object-cover"
                                            onError={() => setBrokenImages(prev => ({ ...prev, [keyId]: true }))}
                                        />
                                    ) : (
                                        <div className={`w-full h-full ${BG_COLORS[i % BG_COLORS.length]} flex items-center justify-center text-white font-black text-xl`}>
                                            {initials}
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-[10px] md:text-[14px] font-black text-gray-400 leading-tight mb-3 h-5 overflow-hidden w-full px-1 capitalize">
                                    {c.first_name || ''} {c.last_name || ''}
                                </h4>
                                <button className="custom-main-color-button text-white text-[10px]  sm:text-[12px] font-black px-3 py-2 rounded-xl w-full hover:bg-blue-700 transition-colors shadow-sm active:scale-95">
                                    {c.orders_count || 0} Orders
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-4 flex justify-center">
                <div className="w-10 h-1 rounded-full bg-slate-100" />
            </div>
        </div>
    );
};

export default TopCustomers;