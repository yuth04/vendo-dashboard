import React from 'react';
import { Loader2 } from 'lucide-react';
import {BsDatabaseSlash} from "react-icons/bs";
import {CustomerStatsData} from "@/src/app/components/modules/dashboard/core/models/dashboardModel";

interface Props {
    data?: CustomerStatsData;
    loading?: boolean;
}

const CustomerStats: React.FC<Props> = ({ data, loading }) => {
    const hourly = data?.order_distribution_by_hour ?? [];
    const rawMax = Math.max(...hourly.map(h => h.customer_count), 0);
    const maxCount = rawMax > 0 ? Math.ceil(rawMax) : 4;

    const activeHours = hourly.filter(h => h.customer_count > 0);

    return (
        <div className="card-theme p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col w-full">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-[var(--header-text)] font-bold text-[18px] sm:text-[20px]">Customer Stats</h3>
                    <p className="text-[10px] sm:text-[12px] font-bold text-slate-400 mt-0.5">
                        Order distribution by hour
                    </p>
                </div>
                {loading && <Loader2 size={14} className="animate-spin text-slate-400" />}
            </div>

            {!loading && activeHours.length === 0 ? (
                <div
                    className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-300 text-sm font-bold">
                    <BsDatabaseSlash className="w-10 h-10 text-gray-300"/>
                    <span>No data</span>
                </div>
            ) : (
                <div className="flex gap-2 sm:gap-4">
                    <div
                        className="flex flex-col justify-between text-[9px] sm:text-[10px] font-bold text-slate-400 pb-6 h-48 text-right min-w-[15px] sm:min-w-[20px]">
                    {[maxCount, Math.round(maxCount * 0.66), Math.round(maxCount * 0.33), 0].map((v, i) => (
                            <span key={i}>{v}</span>
                        ))}
                    </div>

                    {/* Chart Container */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="relative flex items-end gap-[2px] sm:gap-[6px] h-48 w-full border-b border-slate-100 px-1 sm:px-2">
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-[1px]">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-full border-t border-slate-100 border-dashed opacity-50" />
                                ))}
                            </div>

                            {/* Bars */}
                            {hourly.map((item, index) => {
                                const pct = (item.customer_count / maxCount) * 100;
                                return (
                                    <div
                                        key={index}
                                        className="flex-1 flex flex-col items-center z-10 group relative h-full justify-end"
                                    >
                                        <div
                                            style={{ height: `${item.customer_count > 0 ? Math.max(pct, 5) : 0}%` }}
                                            className={`w-full rounded-t-[2px] transition-all duration-300 cursor-pointer ${
                                                item.customer_count > 0
                                                    ? 'bg-[#6699FF] hover:bg-[#4477EE]'
                                                    : 'bg-transparent'
                                            }`}
                                        />

                                        {/* Tooltip - Responsive size */}
                                        {item.customer_count > 0 && (
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white shadow-xl border border-slate-50 text-slate-600 text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-20 flex gap-1 sm:gap-2 items-center">
                                                <span className="text-slate-400 hidden xs:inline">Customers</span>
                                                <span className="font-bold text-slate-900">{item.customer_count} customer</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* X-Axis — Labels hide on mobile to prevent overlapping */}
                        <div className="flex justify-between mt-2 px-1 sm:px-2">
                            {hourly.map((item, i) => (
                                <span
                                    key={i}
                                    className={`text-[8px] sm:text-[10px] font-bold text-slate-400 w-full text-center 
                                        ${i % 2 !== 0 ? 'hidden sm:block' : 'block'}`}
                                >
                                    {item.hour}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Summary pills - Responsive wrapping */}
            {activeHours.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {activeHours.slice(0, 4).map((h, i) => (
                        <div key={i} className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#6699FF]" />
                            <span className="text-[9px] sm:text-[10px] font-bold text-indigo-600 whitespace-nowrap">
                                {h.hour}: {h.customer_count} customers
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerStats;