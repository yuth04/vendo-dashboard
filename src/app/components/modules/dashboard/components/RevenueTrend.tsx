import React from 'react';
import { Loader2 } from 'lucide-react';
import {BsDatabaseSlash} from "react-icons/bs";
import {RevenueTrendPoint} from "@/src/app/components/modules/dashboard/core/models/dashboardModel";

interface Props {
    data?: RevenueTrendPoint[];
    loading?: boolean;
}

const RevenueTrend: React.FC<Props> = ({ data = [], loading }) => {
    const maxRevenue = Math.max(...data.map(d => Number(d.revenue)), 1);
    const yAxisLabels = [maxRevenue, maxRevenue * 0.75, maxRevenue * 0.5, maxRevenue * 0.25, 0]
        .map(v => `$${v.toFixed(0)}`);

    return (
        <div className="card-theme p-6 rounded-[2rem] border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-[20px] font-bold text-[var(--header-text)]">Revenue Trend</h3>
                    <p className="text-[12px] font-bold text-slate-400">Real-time daily metrics</p>
                </div>
                {loading && <Loader2 size={16} className="animate-spin custom-main-color-icon" />}
            </div>

            {!loading && data.length === 0 ? (
                <div
                    className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-300 text-sm font-bold">
                    <BsDatabaseSlash className="w-10 h-10 text-gray-300"/>
                    <span>No data</span>
                </div>
            ) : (
                <div className="flex flex-1 gap-4">
                    <div className="flex flex-col justify-between text-[10px] font-bold text-slate-300 pb-8 h-64">
                    {yAxisLabels.map((l, i) => <span key={i}>{l}</span>)}
                    </div>

                    {/* Chart */}
                    <div className="flex-1 flex flex-col">
                        <div className="relative flex items-end justify-around h-64 w-full border-b border-slate-100">
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-full border-t border-slate-50 border-dashed" />
                                ))}
                            </div>
                            {data.map((item, index) => {
                                const pct = (Number(item.revenue) / maxRevenue) * 100;
                                return (
                                    <div
                                        key={index}
                                        style={{ height: `${pct}%` }}
                                        className="w-1/4 bg-[#35D0BA] rounded-t-xl transition-all duration-300 hover:bg-[#2FE1D6] hover:shadow-lg cursor-pointer relative z-10 group"
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                            ${Number(item.revenue).toFixed(2)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-around mt-3">
                            {data.map((item, i) => (
                                <span key={i} className="text-[10px] font-bold text-slate-400 uppercase">{item.date}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevenueTrend;