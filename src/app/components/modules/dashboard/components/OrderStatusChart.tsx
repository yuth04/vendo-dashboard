import React from 'react';
import { Loader2 } from 'lucide-react';

interface OrderCarts {
    total: number;
    labels: string[];
    series: number[];
}

interface Props {
    data?: OrderCarts;
    loading?: boolean;
}

const COLORS = ['#f58506', '#3B82F6', '#8B5CF6', '#06B6D4' , '#10B981','#EF4444'];

const OrderStatusChart: React.FC<Props> = ({ data, loading }) => {
    const total = data?.total ?? 0;
    const labels = data?.labels ?? ['Pending', 'Confirmed', 'Shipping', 'Delivered', 'Cancelled'];
    const series = data?.series ?? [0, 0, 0, 0, 0];
    const grandTotal = series.reduce((a, b) => a + b, 0) || 1;

    // Build conic-gradient segments
    let cumulative = 0;
    const segments = series.map((val, i) => {
        const pct = (val / grandTotal) * 100;
        const start = cumulative;
        cumulative += pct;
        return { label: labels[i], val, pct, start, color: COLORS[i] };
    });

    const gradient = segments
        .map(s => `${s.color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`)
        .join(', ');

    return (
        <div className="card-theme p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center h-full">
            <div className="w-full mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-[var(--header-text)] font-bold text-[20px] sm:text-[20px]">Order Status</h3>
                    <p className="text-[10px] sm:text-[12px] text-slate-400 font-bold">Status distribution</p>
                </div>
                {loading && <Loader2 size={14} className="animate-spin custom-main-color-icon" />}
            </div>

            {/* Donut */}
            <div
                className="relative w-40 h-40 rounded-full my-4 flex items-center justify-center"
                style={{ background: grandTotal > 0 ? `conic-gradient(${gradient})` : '#e2e8f0' }}
            >
                <div className="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
                    <p className="text-4xl font-black text-slate-800 leading-none">{total}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Orders</p>
                </div>
            </div>

            {/* Legend */}
            <div className="w-full mt-4 space-y-2">
                {segments.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{s.label}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-500">{s.val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderStatusChart;