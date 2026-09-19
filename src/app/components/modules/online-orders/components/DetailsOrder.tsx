'use client';

import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    MapPin,
    User,
    CreditCard,
    Loader2,
    Calendar,
    Activity,
    Package,
    ChevronRight,
    CheckCircle,
    XCircle,
    Truck,
    PackageCheck,
    RefreshCcw,ShoppingCart
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { OrderDetailsData } from "@/src/app/components/modules/online-orders/core/models/onlineOrdersModel";
import { onlineorderClient } from "@/src/app/components/modules/online-orders/core/api/onlineOrdersClient";
import { onlineOrdersService } from "@/src/app/components/modules/online-orders/core/services/onlineOrdersService";
import {PageLoader} from "@/src/app/components/helpers/components/PageLoader";
import {DataNotFound} from "@/src/app/components/helpers/components/DataNotFound";

interface Props {
    orderId?: string | number;
    onBack?: () => void;
}

const DetailsOrder = ({ orderId, onBack }: Props) => {
    const [order, setOrder] = useState<OrderDetailsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        type: 'payment' | 'status',
        targetStatus?: string,
        icon: React.ReactNode,
        color: string
    } | null>(null);

    const router = useRouter();

    const getDetails = async () => {
        if (!orderId || orderId === "undefined") return;
        try {
            setLoading(true);
            const id = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId;
            const res = await onlineorderClient.fetchOrderDetails(id);
            const finalData = onlineOrdersService.unwrapOrderDetails(res);
            if (finalData) setOrder(finalData);
        } catch (err) {
            console.error("Fetch Details Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDetails();
    }, [orderId]);

    const handleBack = () => onBack ? onBack() : router.back();

    const openStatusConfirm = (targetStatus: string, icon: React.ReactNode, color: string) => {
        setModalConfig({ type: 'status', targetStatus, icon, color });
        setIsModalOpen(true);
    };

    const openPaymentConfirm = (targetStatus: string, color: string) => {
        if (!order) return;
        setModalConfig({
            type: 'payment',
            targetStatus: targetStatus,
            icon: <CreditCard size={32} />,
            color: color
        });
        setIsModalOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!order || !modalConfig) return;

        setIsModalOpen(false);
        setIsUpdating(true);

        try {
            if (modalConfig.type === 'payment') {
                await onlineorderClient.updatePayment(order.id, modalConfig.targetStatus!.toLowerCase());
            } else {
                switch (modalConfig.targetStatus) {
                    case 'PROCESSING':
                        await onlineorderClient.confirmOrder(order.id);
                        break;
                    case 'SHIPPING':
                        await onlineorderClient.shipOrder(order.id);
                        break;
                    case 'DELIVERED':
                        await onlineorderClient.deliverOrder(order.id);
                        break;
                    case 'COMPLETED':
                        await onlineorderClient.completeOrder(order.id);
                        break;
                    case 'CANCELLED':
                        console.warn("Cancel endpoint not implemented");
                        break;
                }
            }
            await getDetails();
        } catch (e) {
            console.error(e);
        } finally {
            setIsUpdating(false);
            setModalConfig(null);
        }
    };

    if (loading) {
        return (
            <PageLoader/>
        );
    }

    if (!order) {
        return (
            <DataNotFound
                title="Order Not Found."
                message="We couldn't find any orders matching your search criteria."
                icon={ShoppingCart}
            />
        );
    }


    const subtotal = onlineOrdersService.calculateSubtotal(order.items);
    const shipping = onlineOrdersService.parseShippingFee(order.shipping_fee);
    const total = onlineOrdersService.calculateTotal(subtotal, shipping);

    const currentPayStatus = order.payment_status?.toUpperCase();
    const isPaid = currentPayStatus === 'PAID';

    return (
        <div className="min-h-screen sm:p-4 py-4 md:p-8">
            {isModalOpen && modalConfig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="card-theme rounded-[32px] p-8 max-w-sm w-full mx-4 shadow-2xl transition-all">
                        <div className="flex flex-col items-center text-center">
                            <div
                                className="w-16 h-16 card-theme custom-main-color-text-hover rounded-full flex items-center justify-center mb-6 text-gray-400">
                                {modalConfig.icon}
                            </div>
                            <h2 className="text-[18px] sm:text-[20px] font-black text-[var(--header-text)] mb-3">Update
                                Order Status</h2>
                            <p className="text-gray-500 font-medium mb-8">
                                Are you sure you want to update this order to
                                <span className="font-black text-[var(--header-text)] uppercase ml-1">
                                    {modalConfig.targetStatus}
                                </span> ?
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setModalConfig(null);
                                    }}
                                    className="px-5 md:px-6 py-3 text-[10px] md:text-[12px] font-black text-gray-400 card-theme rounded-[20px] tracking-widest hover:text-gray-600 transition-colors disabled:opacity-40 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    className={`flex-1 items-center justify-center gap-2 rounded-[20px] px-6 md:px-10 py-3 text-xs md:text-sm text-white font-bold transition-all active:scale-95 cursor-pointer shadow-lg ${modalConfig.color}`}
                                >
                                    Yes, Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Header / Nav */}
            <div className="sm:p-4">
                <nav className="flex items-center gap-2 text-[12px] sm:text-[14px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
                    <span
                        className="custom-main-color-text-hover cursor-pointer transition-colors shrink-0"
                        onClick={() => router.push('/admin/dashboard')}
                    >
                        Dashboard
                    </span>
                    <ChevronRight size={12} className="text-gray-300 shrink-0"/>
                    <span className="custom-main-color-text-hover cursor-pointer transition-colors shrink-0"
                          onClick={() => router.push('/admin/online-orders')}>
                        Online Orders
                    </span>
                    <ChevronRight size={12} className="text-gray-300 shrink-0"/>
                    <span className="text-[var(--header-text)] shrink-0">
                    Orders Details
                </span>
                </nav>

                {/* Main Header Container */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-3 sm:gap-5">
                        {/* Back Button */}
                        <button onClick={handleBack}
                                className="p-2 sm:p-3 hover:bg-gray-100 card-theme rounded-full transition-colors cursor-pointer shrink-0">
                            <ArrowLeft size={20} className="text-[var(--header-text)] sm:w-6 sm:h-6"/>
                        </button>
                        {/* Title & Date */}
                        <div className="min-w-0">
                            <h1 className="text-[24px] sm:text-[30px] font-black text-[var(--header-text)] uppercase tracking-tight truncate">
                                Order #{order.order_number}
                            </h1>
                            <div className="flex items-center gap-2 text-slate-400 mt-1">
                                <Calendar size={14} className="shrink-0"/>
                                <span className="text-[12px] sm:text-[14px] font-bold">{order.date}</span>
                                <span className='text-slate-400 font-bold mb-[2px]'>{order.payment_method}</span>
                            </div>
                        </div>
                    </div>
                    {/* Status Tags */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest border ${
                                    order.status?.toLowerCase() === 'pending'
                                        ? 'bg-blue-50 text-blue-500 border-blue-100'
                                        : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                                }`}>
                                {order.status}
                            </span>
                        <span
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest border ${
                                isPaid
                                    ? 'bg-emerald-50 text-emerald-500 border-emerald-100'
                                    : 'bg-red-50 text-red-500 border-red-100'
                            }`}>
                            {order.payment_status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="min-h-screen sm:p-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    {/* Order Items */}
                    <div className="card-theme rounded-[32px] p-8 shadow-sm border border-gray-50">
                        <div className="flex items-center gap-3 mb-8">
                            <Package size={20} className="text-slate-400"/>
                            <h3 className="text-[17px] font-black text-[var(--header-text)]">Order Items</h3>
                        </div>

                        <div className="space-y-6">
                            {order.items?.map((item) => (
                                <div key={item.id}
                                     className="flex items-center justify-between p-4 rounded-[24px] card-theme border border-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-16 h-16 rounded-[18px] bg-white overflow-hidden flex items-center justify-center border border-gray-100">
                                            {item.product_image ? (
                                                <img src={item.product_image} alt={item.product_name || 'Product'}
                                                     className="w-full h-full object-contain"/>
                                            ) : (
                                                <span className="font-black text-slate-300 text-[10px]">IMG</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[var(--header-text)] text-[15px]">{item.product_name || 'Product'}</h4>
                                            <p className="text-[12px] font-bold text-slate-400 py-2">Quantity : {item.quantity} ×
                                                ${item.price}</p>
                                            <p className="text-[12px] font-bold text-[var(--header-text)] ">Size: {item.size} |
                                                Color: {item.color}</p>
                                        </div>
                                    </div>
                                    <span
                                        className="font-black text-[var(--header-text)] text-[16px]">${item.subtotal}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pt-8 border-t border-dashed border-gray-200 space-y-3">
                            <div className="flex justify-between text-[14px] font-bold text-[var(--header-text)]">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[14px] font-bold">
                                <span className="text-[var(--header-text)]">Shipping Fee</span>
                                <span className="text-red-500">${shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <span className="text-[18px] font-black text-[var(--header-text)]">Total</span>
                                <span
                                    className="text-[22px] font-black text-[var(--header-text)]">${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Audit Info */}
                    <div className="card-theme rounded-[32px] p-8 shadow-sm border border-gray-50">
                        <div className="flex items-center gap-3 mb-8">
                            <Activity size={20} className="text-blue-500"/>
                            <h3 className="text-[18px] font-black text-[var(--header-text)]">Activity History</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
                                        {order.customer?.avatar ? (
                                            <img src={order.customer.avatar} alt="avatar"
                                                 className="w-full h-full object-cover"/>
                                        ) : (
                                            <span
                                                className="text-slate-400 font-black text-sm">{order.customer?.first_name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-black text-[var(--header-text)]">{i === 1 ? 'Created By' : 'Last Updated By'}</p>
                                        <p className="font-black text-[14px] text-gray-400">{order.customer?.first_name} {order.customer?.last_name}</p>
                                        <p className="text-[12px] font-bold text-slate-400">{order.customer?.email}</p>
                                        <p className="text-[11px] font-bold text-[var(--header-text)] mt-1 flex items-center gap-1">
                                            <Calendar size={10}/> {order.date}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="card-theme rounded-[32px] p-8 shadow-sm border border-gray-100">
                        <h3 className="text-[18px] font-black text-[var(--header-text)] mb-6">Actions</h3>
                        <div className="space-y-4">
                            {order.status?.toUpperCase() === 'PENDING' && (
                                <>
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => openStatusConfirm('PROCESSING', <CheckCircle
                                            size={32}/>, 'bg-emerald-500')}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-[20px] font-black text-[14px] hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50">
                                        {isUpdating ? <Loader2 size={18} className="animate-spin"/> :
                                            <RefreshCcw size={18}/>}
                                        Mark Processing
                                    </button>
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => openStatusConfirm('CANCELLED', <XCircle
                                            size={32}/>, 'bg-red-500')}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-red-50 text-red-500 rounded-[20px] font-black text-[14px] hover:bg-red-100 transition-all cursor-pointer">
                                        <XCircle size={18}/> Cancel Order
                                    </button>
                                </>
                            )}

                            {order.status?.toUpperCase() === 'PROCESSING' && (
                                <button
                                    disabled={isUpdating}
                                    onClick={() => openStatusConfirm('SHIPPING', <Truck size={32}/>, 'bg-violet-500')}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-violet-600 text-white rounded-[20px] font-black text-[14px] hover:bg-violet-700 transition-all cursor-pointer disabled:opacity-50">
                                    {isUpdating ? <Loader2 size={18} className="animate-spin"/> : <Truck size={18}/>}
                                    Mark Shipping
                                </button>
                            )}

                            {(order.status?.toUpperCase() === 'SHIPPING' || order.status?.toUpperCase() === 'SHIPPED') && (
                                <button
                                    disabled={isUpdating}
                                    onClick={() => openStatusConfirm('DELIVERED', <PackageCheck
                                        size={32}/>, 'bg-cyan-500')}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-cyan-600 text-white rounded-[20px] font-black text-[14px] hover:bg-cyan-700 transition-all cursor-pointer disabled:opacity-50">
                                    {isUpdating ? <Loader2 size={18} className="animate-spin"/> :
                                        <PackageCheck size={18}/>}
                                    Mark Delivered
                                </button>
                            )}

                            {order.status?.toUpperCase() === 'DELIVERED' && (
                                <button
                                    disabled={isUpdating}
                                    onClick={() => openStatusConfirm('COMPLETED', <CheckCircle
                                        size={32}/>, 'bg-emerald-500')}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-[20px] font-black text-[14px] hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50">
                                    {isUpdating ? <Loader2 size={18} className="animate-spin"/> :
                                        <CheckCircle size={18}/>}
                                    Mark Completed
                                </button>
                            )}

                            {isPaid ? (
                                <>
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => openPaymentConfirm('UNPAID', 'bg-red-500')}
                                        className="w-full flex items-center justify-center gap-3 py-4 border-2 border-red-100 text-red-500 hover:bg-red-50 rounded-[20px] font-black text-[14px] transition-all cursor-pointer disabled:opacity-50">
                                        {isUpdating ? <Loader2 size={18} className="animate-spin"/> :
                                            <CreditCard size={18}/>}
                                        Mark Unpaid
                                    </button>
                                    <button
                                        disabled={isUpdating}
                                        onClick={() => openPaymentConfirm('REFUNDED', 'bg-slate-700')}
                                        className="w-full flex items-center justify-center gap-3 py-4 border-2 border-slate-100 text-[var(--header-text)] hover:bg-slate-400 rounded-[20px] font-black text-[14px] transition-all cursor-pointer disabled:opacity-50">
                                        {isUpdating ? <Loader2 size={18} className="animate-spin"/> :
                                            <CreditCard size={18}/>}
                                        Mark Payment Refunded
                                    </button>
                                </>
                            ) : (
                                <button
                                    disabled={isUpdating}
                                    onClick={() => openPaymentConfirm('PAID', 'bg-emerald-500')}
                                    className="w-full flex items-center justify-center gap-3 py-4 border-2 border-emerald-100 text-emerald-500 hover:bg-emerald-50 rounded-[20px] font-black text-[14px] transition-all cursor-pointer disabled:opacity-50">
                                    {isUpdating ? <Loader2 size={18} className="animate-spin"/> :
                                        <CreditCard size={18}/>}
                                    Mark Paid
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="card-theme rounded-[32px] p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <User size={18} className="text-slate-400"/>
                            <h3 className="text-[17px] font-black text-[var(--header-text)]">Customer</h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-md">
                                {order.customer?.avatar ? (
                                    <img src={order.customer.avatar} alt="customer"
                                         className="w-full h-full object-cover"/>
                                ) : (
                                    <span
                                        className="text-slate-400 font-black text-lg">{order.customer?.first_name?.charAt(0)}</span>
                                )}
                            </div>
                            <div>
                                <h4 className="font-black text-[var(--header-text)] text-[15px]">{order.customer?.first_name} {order.customer?.last_name}</h4>
                                <p className="text-[13px] font-bold text-slate-400">{order.customer?.email}</p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="text-slate-400"/>
                                <div>
                                    <p className="text-[13px] font-black text-[var(--header-text)] mb-1">
                                        Shipping Address
                                    </p>
                                    <div className="p-4 rounded-[20px] card-theme text-[12px] font-bold text-[var(--header-text)] leading-relaxed">
                                        {/* Name */}
                                        <span className="text-[var(--header-text)] block mb-1 text-[14px]">
                                            {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                                        </span>
                                        {/* Address Details */}
                                        {order.shipping_address?.address_line}<br/>
                                        {order.shipping_address?.city}, {order.shipping_address?.province}<br/>
                                        {order.shipping_address?.postal_code}<br/>
                                        {/* Phone Number */}
                                        <span className="mt-1 block text-[12px]">
                                         Tel : {order.shipping_address?.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailsOrder;