"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    AlertCircle,
    Image as ImageIcon,
    CheckCircle,
    XCircle,
    User,
    Package,
    Loader2, ChevronRight
} from 'lucide-react';
import {ReturnDetailItem} from "@/src/app/components/modules/customer-return/core/models/customerReturnModel";
import {customerrturnClient} from "@/src/app/components/modules/customer-return/core/api/customerReturnClient";
import { customerReturnService } from "@/src/app/components/modules/customer-return/core/services/customerReturnService";

const DetailReturns = () => {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<ReturnDetailItem | null>(null);
    const [loading, setLoading] = useState(true);

    const [processing, setProcessing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'APPROVED' | 'REFUNDED' | 'REJECTED'>('APPROVED');

    const loadDetail = async (signal?: AbortSignal) => {
        try {
            if (!params?.id) return;
            const response = await customerrturnClient.fetchReturnDetails(params.id as string, signal);
            if (response?.data?.data) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Error loading return details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        loadDetail(controller.signal);
        return () => controller.abort();
    }, [params?.id]);

    const handleOpenModal = (type: 'APPROVED' | 'REFUNDED' | 'REJECTED') => {
        setModalType(type);
        setShowModal(true);
    };

    const handleConfirmUpdate = async () => {
        if (!data?.id) return;
        setProcessing(true);
        try {
            if (modalType === 'APPROVED') {
                await customerrturnClient.approveReturn(data.id);
            } else if (modalType === 'REFUNDED') {
                await customerrturnClient.completeReturn(data.id);
            } else if (modalType === 'REJECTED') {
                await customerrturnClient.rejectReturn(data.id);
            }

            setShowModal(false);
            await loadDetail();
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen sm:p-4 py-4 md:p-8">
            <nav className="flex items-center gap-2 text-[12px] sm:text-[14px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
                <span className="custom-main-color-text-hover cursor-pointer transition-colors shrink-0"
                      onClick={() => router.push('/admin/dashboard')}>Dashboard</span>
                <ChevronRight size={12} className="text-gray-300 shrink-0"/>
                <span className="custom-main-color-text-hover cursor-pointer transition-colors shrink-0"
                      onClick={() => router.push('/admin/customer-return')}>Customer Returns</span>
                <ChevronRight size={12} className="text-gray-300 shrink-0"/>
                <span className="text-[var(--header-text)] shrink-0">Return Details</span>
            </nav>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-gray-100 card-theme transition-colors cursor-pointer shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 text-[var(--header-text)] "/>
                    </button>
                    <div>
                        <h1 className="text-[24px] sm:text-[30px] font-bold text-[var(--header-text)] leading-tight">
                            Return Request #{data?.order_number}
                        </h1>
                        <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mt-1">
                            <Calendar size={14}/>
                            <span className="text-[12px] sm:text-[14px] font-bold">{data?.date}</span>
                        </div>
                    </div>
                </div>

                <span
                    className={`px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold tracking-wide border uppercase shrink-0 ${customerReturnService.getStatusStyles(data?.status)}`}
                >
                {data?.status}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="card-theme p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 font-bold mb-4">
                            <AlertCircle size={18} className="text-gray-400"/>
                            <h2 className="text-[var(--header-text)]">Reason for Return</h2>
                        </div>
                        <div className="card-theme p-4 rounded-[20px] text-gray-400 mb-6 font-medium text-sm sm:text-base">
                            {data?.reason}
                        </div>

                        <div className="flex items-center gap-2 font-bold mb-2">
                            <ImageIcon size={18} className="text-gray-400"/>
                            <h2 className="text-[var(--header-text)]">Customer Note</h2>
                        </div>
                        <p className="text-gray-400 text-sm italic card-theme p-4 rounded-[20px]">
                            {data?.note || "No note provided."}
                        </p>
                    </div>

                    <div className="card-theme p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 font-bold mb-4">
                            <Package size={18} className="text-gray-400"/>
                            <h2 className="text-[var(--header-text)]">Items to Return</h2>
                        </div>
                        <div className="space-y-4">
                            {data?.items?.map((item) => (
                                <div key={item.id}
                                     className="flex items-center gap-4 p-3 card-theme rounded-xl border border-gray-100">
                                    {item.product_image ? (
                                        <img
                                            src={item.product_image}
                                            alt={item.product_name || "Product"}
                                            className="w-14 h-14 rounded-lg object-contain border bg-gray-50 shrink-0"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-lg border bg-gray-50 flex items-center justify-center text-gray-300 shrink-0">
                                            <ImageIcon size={20} />
                                        </div>
                                    )}
                                    <div className="flex-grow min-w-0">
                                        <p className="font-bold text-[var(--header-text)] text-sm truncate">{item.product_name}</p>
                                        <p className="text-xs text-gray-400">Size: {item.size} | Color: {item.color}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-[var(--header-text)] text-sm">${item.price}</p>
                                        <p className="text-xs text-gray-400">Quantity : {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card-theme p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="font-bold mb-6 text-[var(--header-text)] text-lg">Actions</h2>
                        <div className="space-y-3">
                            {data.status === 'requested' && (
                                <>
                                    <button
                                        disabled={processing}
                                        onClick={() => handleOpenModal('APPROVED')}
                                        className="w-full flex items-center justify-center gap-2 bg-cyan-500 text-white py-3 rounded-xl font-bold hover:bg-cyan-600 transition disabled:opacity-50 cursor-pointer">
                                        <CheckCircle size={18}/> Approve Return
                                    </button>
                                    <button
                                        disabled={processing}
                                        onClick={() => handleOpenModal('REJECTED')}
                                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 py-3 rounded-xl font-bold hover:bg-red-100 transition disabled:opacity-50 cursor-pointer">
                                        <XCircle size={18}/> Reject Return
                                    </button>
                                </>
                            )}
                            {data.status === 'approved' && (
                                <button
                                    disabled={processing}
                                    onClick={() => handleOpenModal('REFUNDED')}
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition disabled:opacity-50 cursor-pointer">
                                    <CheckCircle size={18}/> Complete Refund
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="card-theme p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 font-bold mb-6">
                            <User size={18} className="text-gray-400"/>
                            <h2 className="text-[var(--header-text)]">Customer</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            {data?.customer?.avatar ? (
                                <img
                                    src={data.customer.avatar}
                                    alt="Avatar"
                                    className="w-12 h-12 rounded-full object-center shrink-0"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold text-lg shrink-0 uppercase">
                                    {data?.customer?.first_name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <p className="font-bold text-[var(--header-text)] truncate">{data?.customer?.first_name} {data?.customer?.last_name}</p>
                                <p className="text-xs text-gray-400 truncate">{data?.customer?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="card-theme rounded-[32px] p-6 sm:p-8 w-full max-w-sm shadow-2xl text-center animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 card-theme rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                                <CheckCircle className="text-gray-400" size={32}/>
                            </div>
                        </div>
                        <h2 className="text-[20px] font-bold mb-3 text-[var(--header-text)]">Confirm Action</h2>
                        <p className="text-gray-500 mb-8 px-2 text-sm leading-relaxed">
                            Are you sure you want to mark this return as <span className="font-bold text-[var(--header-text)]">{modalType}</span>?
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                disabled={processing}
                                className="flex-1 px-4 py-3.5 text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-all active:scale-95 disabled:opacity-40 cursor-pointer border border-gray-50"
                            >
                                CANCEL
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleConfirmUpdate}
                                className="flex-[1.5] flex items-center justify-center gap-2 rounded-[20px] px-4 py-3.5 text-[12px] text-white font-black tracking-widest uppercase transition-all active:scale-95 cursor-pointer shadow-lg bg-cyan-400 hover:bg-cyan-500 disabled:bg-gray-200 disabled:shadow-none"
                            >
                                {processing ? <Loader2 size={16} className="animate-spin" /> : "YES, UPDATE"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailReturns;