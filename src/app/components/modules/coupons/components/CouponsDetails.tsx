"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft, BadgePercent, Calendar,
    ShieldCheck, ShieldAlert, Tag, Hash, Layers,
    ImageOff, Clock, RefreshCw, Users, ArrowLeft, ChevronRight
} from 'lucide-react';
import { Coupon } from "@/src/app/components/modules/coupons/core/models/couponModel";
import { couponService } from "@/src/app/components/modules/coupons/core/services/couponService";
import {PageLoader} from "@/src/app/components/helpers/components/PageLoader";
import {DataNotFound} from "@/src/app/components/helpers/components/DataNotFound";

const formatDate = (raw?: string) => {
    if (!raw) return "N/A";
    return raw.split(" ")[0];
};

const isExpired = (endDate?: string) => {
    if (!endDate) return false;
    const [day, month, year] = endDate.split(" ")[0].split("-").map(Number);
    return new Date(year, month - 1, day) < new Date();
};

const usagePercent = (used: number, limit: number) =>
    limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

const CouponsDetails = () => {
    const { id } = useParams();
    const router  = useRouter();

    const [coupon, setCoupon]   = useState<Coupon | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!id) return;
        setLoading(true);
        couponService.fetchCouponById(id as string)
            .then(res => {
                if (!res.error && res.data) {
                    setCoupon(res.data);
                } else {
                    setCoupon(null);
                }
            })
            .catch(err => console.error("Failed to fetch coupon", err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <PageLoader/>
        );
    }

    if (!coupon) return (
        <DataNotFound
            title="Coupon not found."
            message="We couldn't find any soupons matching your search criteria."
            icon={BadgePercent}
        />
    );

    const expired  = isExpired(coupon.end_date);
    const pct      = usagePercent(coupon.used, coupon.usage_limit);
    const isActive = coupon.status === "active";
    const isLimitReached = coupon.used >= coupon.usage_limit;

    return (
        <div className="min-h-screen sm:p-4 py-4 md:p-8">
            <nav
                className="flex items-center gap-2 text-[12px] sm:text-[14px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
                <span className="custom-main-color-text-hover cursor-pointer"
                      onClick={() => router.push('/admin/dashboard')}>Dashboard</span>
                <ChevronRight size={12} strokeWidth={3} className="shrink-0"/>
                <span className="custom-main-color-text-hover cursor-pointer"
                      onClick={() => router.push('/admin/coupons')}>Coupons</span>
                <ChevronRight size={12} strokeWidth={3} className="shrink-0"/>
                <span className="text-[var(--header-text)]">Coupons Details</span>
            </nav>

            <div className="flex items-center gap-5 mb-6">
                <button onClick={() => router.back()}
                        className="p-2 sm:p-3 hover:bg-gray-100 card-theme rounded-full transition-colors cursor-pointer">
                    <ArrowLeft size={24} className="text-[var(--header-text)]"/>
                </button>
                <div>
                    <h1 className="text-[20px] sm:text-[30px] font-black text-[var(--header-text)] tracking-tight">
                        Back to Coupons</h1>
                </div>
            </div>

            <div className="card-theme rounded-[20px] p-6 shadow-sm mb-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    {/* Coupon image or icon */}
                    <div
                        className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                        {coupon.image ? (
                            <img src={coupon.image} alt={coupon.name} className="w-full h-full object-contain p-1"/>
                        ) : (
                            <ImageOff size={28} className="text-gray-300"/>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-[24px] sm:text-[30px] font-black text-[var(--header-text)]">{coupon.name}</h1>
                            {/* Status badge */}
                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black border uppercase
                                ${isActive && !expired
                                ? 'bg-emerald-50 text-emerald-500 border-emerald-100'
                                : 'bg-red-50 text-red-500 border-red-100'}`}>
                                {isActive && !expired ? <ShieldCheck size={11}/> : <ShieldAlert size={11}/>}
                                {expired ? "Expired" : coupon.status}
                            </span>
                        </div>

                        {/* Code pill */}
                        <div
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-2">
                            <Hash size={12} className="text-blue-500"/>
                            <span className="text-xs font-black text-blue-600 tracking-widest">{coupon.code}</span>
                        </div>

                        {coupon.description && (
                            <p className="text-sm text-gray-400 leading-relaxed">{coupon.description}</p>
                        )}
                    </div>

                    {/* Discount value — big highlight */}
                    <div
                        className="shrink-0 flex flex-col items-center justify-center w-28 h-26 rounded-2xl custom-main-color-card border border-dashed border-emerald-200">
                        <BadgePercent size={18} className="custom-main-color-icon mb-1"/>
                        <span className="text-[20px] sm:text-[24px] font-black custom-main-color-icon leading-none">
                            {coupon.type === 'percent' ? `${coupon.value}%` : `$${coupon.value}`}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                            {coupon.type === 'percent' ? 'off' : 'fixed'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Stats grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">

                {/* Min order */}
                <div className="card-theme rounded-[20px] p-4 shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold mb-1">
                        <Tag size={13}/> Min Order
                    </div>
                    <span className="text-xl font-black text-[var(--header-text)]">${coupon.min_amount}</span>
                </div>

                {/* Max discount */}
                <div className="card-theme rounded-[20px] p-4 shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold mb-1">
                        <Layers size={13}/> Max Discount
                    </div>
                    <span className="text-xl font-black text-[var(--header-text)]">${coupon.max_discount}</span>
                </div>

                {/* Usage */}
                <div className="card-theme rounded-[20px] p-4 shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold mb-1">
                        <Users size={13}/> Usage
                    </div>
                    <span className={`text-xl font-black ${isLimitReached ? 'text-red-500' : 'text-[var(--header-text)]'}`}>
                        {coupon.used}
                        <span className={`text-sm font-bold ${isLimitReached ? 'text-gray-400' : 'text-gray-400'}`}> / {coupon.usage_limit}</span>
                    </span>
                </div>

                {/* Type */}
                <div className="card-theme rounded-[20px] p-4 shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold mb-1">
                        <BadgePercent size={13}/> Type
                    </div>
                    <span className="text-xl font-black text-[var(--header-text)] capitalize">{coupon.type}</span>
                </div>
            </div>

            {/* ── Usage progress ── */}
            <div className="card-theme rounded-[20px] p-5 shadow-sm mb-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-[var(--header-text)]">Usage Progress</span>
                    <span className="text-sm font-black text-[var(--header-text)]">{pct}%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-400' : 'bg-emerald-400'}`}
                        style={{width: `${pct}%`}}
                    />
                </div>
                <div className="flex justify-between mt-2">
                    <span className="text-[12px] text-gray-400 font-bold">{coupon.used} used</span>
                    <span
                        className="text-[12px] text-gray-400 font-bold">{coupon.usage_limit - coupon.used} remaining</span>
                </div>
            </div>

            {/* ── Validity & timestamps ── */}
            <div className="card-theme rounded-[20px] p-5 shadow-sm">
                <h3 className="text-[14px] font-black text-[var(--header-text)] uppercase tracking-widest mb-4">Dates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                            <Calendar size={15} className="text-emerald-500"/>
                        </div>
                        <div>
                            <p className="text-[14px] font-bold text-[var(--header-text)]">Start Date</p>
                            <p className="text-[12px] font-bold text-[var(--header-text)]">{formatDate(coupon.start_date)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${expired ? 'bg-red-50' : 'bg-amber-50'}`}>
                            <Calendar size={15} className={expired ? 'text-red-400' : 'text-amber-500'}/>
                        </div>
                        <div>
                            <p className="text-[14px] font-bold text-[var(--header-text)]">End Date</p>
                            <p className={`text-[12px] font-bold ${expired ? 'text-red-400' : 'text-[var(--header-text)]'}`}>
                                {formatDate(coupon.end_date)}
                                {expired && <span className="ml-2 text-[12px] text-red-400 font-black">( expired )</span>}
                            </p>
                        </div>
                    </div>

                    {coupon.created_at && (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <Clock size={15} className="text-blue-400"/>
                            </div>
                            <div>
                                <p className="text-[14px] font-bold text-[var(--header-text)]">Created</p>
                                <p className="text-[12px] font-bold text-[var(--header-text)]">{formatDate(coupon.created_at)}</p>
                            </div>
                        </div>
                    )}

                    {coupon.updated_at && (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                <RefreshCw size={15} className="text-purple-400"/>
                            </div>
                            <div>
                                <p className="text-[14px] font-bold text-[var(--header-text)]">Last Updated</p>
                                <p className="text-[12px] font-bold text-[var(--header-text)]">{formatDate(coupon.updated_at)}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CouponsDetails;