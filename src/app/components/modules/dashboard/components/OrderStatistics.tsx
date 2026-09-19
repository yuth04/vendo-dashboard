import React from 'react';
import {Package, Clock, CheckCircle2, Truck, XCircle, RotateCcw, Loader2, MapPinCheck, Home} from 'lucide-react';
import {OrderStats} from "@/src/app/components/modules/dashboard/core/models/dashboardModel";


interface Props {
    data?: OrderStats;
    loading?: boolean;
}

const MiniStat = ({ label, value, icon }: any) => (
    <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-50 card-theme transition-all group">
        <div className="bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
        <div className="min-w-0">
            <p className="text-[9px] font-black text-[var(--header-text)] uppercase leading-none mb-1 tracking-wider truncate">{label}</p>
            <p className="font-black text-sm text-[var(--header-text)]">{value}</p>
        </div>
    </div>
);

const OrderStatistics: React.FC<Props> = ({ data, loading }) => {
    const stats = [
        { label: "Total Orders",  value: data?.total_orders ?? 0, icon: <Package size={16} className="text-slate-600" /> },
        { label: "Pending",       value: data?.pending ?? 0,       icon: <Clock size={16} className="text-orange-400" /> },
        { label: "Confirmed",     value: data?.confirmed ?? 0,     icon: <CheckCircle2 size={16} className="text-emerald-400" /> },
        { label: "Completed",     value: data?.completed ?? 0,     icon: <CheckCircle2 size={16} className="text-indigo-400" /> },
        { label: "Shipped",       value: data?.shipped ?? 0,       icon: <Truck size={16} className="text-blue-400" /> },
        { label: "Delivered",     value: data?.delivered ?? 0,     icon: <Home size={16} className="text-cyan-400" /> },
        { label: "Cancelled",     value: data?.cancelled ?? 0,     icon: <XCircle size={16} className="text-red-400" /> },
        { label: "Returned",      value: data?.returned ?? 0,      icon: <RotateCcw size={16} className="text-purple-400" /> },
    ];

    return (
        <div className="card-theme p-6 rounded-[2rem] border border-slate-100 shadow-sm relative">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[20px] font-bold text-[var(--header-text)]">Order Statistics</h3>
                {loading && <Loader2 size={16} className="animate-spin custom-main-color-icon" />}
            </div>
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {stats.map((s, i) => <MiniStat key={i} {...s} />)}
            </div>
        </div>
    );
};

export default OrderStatistics;