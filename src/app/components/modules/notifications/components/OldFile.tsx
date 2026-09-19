"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Bell, X, ArrowLeft, Trash2, MoreHorizontal,
    Search
} from "lucide-react";
import { useNotification } from "@/src/app/components/context/NotificationContext";
import { useAlert } from "@/src/app/components/context/AlertContext";
import { NotificationOrder } from "@/src/app/components/modules/notifications/core/models/notificationModel";
import { notificationService } from "@/src/app/components/modules/notifications/core/services/notificationService";
import {useNotificationData} from "@/src/app/components/modules/notifications/core/hook/useNotificationData";

interface NotificationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationDrawer = ({ isOpen, onClose }: NotificationDrawerProps) => {
    const { resetCount } = useNotification();
    const { showConfirm, showToast } = useAlert();
    const [notifications, setNotifications] = useState<NotificationOrder[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const [view, setView] = useState<'list' | 'details'>('list');
    const [selectedOrder, setSelectedOrder] = useState<NotificationOrder | null>(null);


    const { data: fetchedData, loading: hookLoading, refetchData } = useNotificationData(
        notificationService.getNotifications,
        null,
        isOpen
    );


    useEffect(() => {
        if (fetchedData && fetchedData.orders) {
            setNotifications(fetchedData.orders);
        } else if (fetchedData === null) {
            setNotifications([]);
        }
    }, [fetchedData]);

    const filteredNotifications = notifications.filter((n) => {
        const query = searchQuery.toLowerCase();
        return (
            n.first_name.toLowerCase().includes(query) ||
            n.last_name.toLowerCase().includes(query) ||
            n.id.toString().includes(query)
        );
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setView('list');
            setShowAll(false);
            resetCount();
            setIsSearching(false);
            setSearchQuery("");
        }
    }, [isOpen]);


    const handleViewDetails = async (id: number) => {
        setDetailLoading(true);
        try {
            const res = await notificationService.getNotificationById(id);
            if (!res.error && res.data) {
                setSelectedOrder(res.data.order);
                setView('details');
            }
        } catch (error) {
            console.error("Failed to fetch details", error);
        } finally {
            setDetailLoading(false);
        }
    };


    const handleDelete = async (id: number) => {
        setActiveMenuId(null);
        const confirmed = await showConfirm({
            title: "Delete Notification",
            message: "Are you sure you want to delete this notification?",
            confirmLabel: "Delete",
            variant: "danger"
        });

        if (!confirmed) return;

        const previousNotifications = [...notifications];
        setNotifications((prev) => prev.filter((n) => n.id !== id));

        try {
            const res = await notificationService.deleteNotification(id);
            if (res.error) {
                throw new Error(res.error.message);
            }
            showToast("Notification deleted successfully", "success");
            refetchData();
        } catch (error) {
            console.error("Failed to delete notification:", error);
            setNotifications(previousNotifications);
            showToast("Failed to delete notification", "error");
        }
    };

    const isCurrentlyLoading = hookLoading || detailLoading;

    return (
        <>
            <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />

            <div
                className={`fixed card-theme top-0 right-0 h-full w-[320px] sm:w-[400px] border-l border-gray-200 dark:border-white/10 shadow-2xl z-[160] flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center gap-3">
                    {view === 'details' && (
                        <button onClick={() => setView('list')}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer">
                            <ArrowLeft size={20}/>
                        </button>
                    )}

                    {isSearching ? (
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 me-auto input-theme px-3 py-2 rounded-[20px] text-sm focus:outline-none"
                        />
                    ) : (
                        <h2 className="text-xl md:text-2xl font-bold text-[var(--header-text)] me-auto">
                            {view === 'list' ? 'Notifications' : 'Order Details'}
                        </h2>
                    )}

                    <div
                        className="flex items-center gap-1 shrink-0">
                        {view === 'list' && (
                            <button onClick={() => setIsSearching(!isSearching)}
                                    className={`p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer ${isSearching ? 'bg-gray-100' : ''}`}>
                                <Search size={20}/>
                            </button>
                        )}
                        <button onClick={onClose}
                                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer">
                            <X size={20}/>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {isCurrentlyLoading && view === 'list' && notifications.length === 0 ? (
                        <div className="space-y-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i}
                                     className="p-4 rounded-xl border border-gray-100 bg-gray-50 dark:bg-white/[0.02] flex gap-4 animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"/>
                                    <div className="flex-1 space-y-3 mt-0.5">
                                        <div className="h-4 bg-gray-200 rounded-md w-3/4"/>
                                        <div className="h-3 bg-gray-200 rounded-md w-1/2"/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : view === 'list' ? (
                        filteredNotifications.length > 0 ? (
                            <div className="space-y-4" ref={menuRef}>
                                {(showAll ? filteredNotifications : filteredNotifications.slice(0, 4)).map((order) => (
                                    <div key={order.id}
                                         className="relative p-4 rounded-xl card-theme flex flex-col sm:flex-row sm:items-start gap-4 shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-gray-100">
                                        <div className="flex-1 min-w-0">
                                            <div
                                                className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-2">
                                                <img src={order.image} alt=""
                                                     className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"/>
                                                <span
                                                    className="font-bold text-xs sm:text-[16px] text-[var(--header-text)]">{order.first_name} {order.last_name}</span>
                                                <h4 className="font-bold ms-3.5 text-sm sm:text-base text-[var(--header-text)] truncate">
                                                    {order.message}
                                                </h4>
                                                <button
                                                    onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)}
                                                    className="ml-auto p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
                                                >
                                                    <MoreHorizontal size={20}/>
                                                </button>
                                            </div>

                                            {activeMenuId === order.id && (
                                                <div
                                                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:p-0">
                                                    <div
                                                        className="fixed inset-0 bg-black/40 backdrop-blur-sm sm:hidden"
                                                        onClick={() => setActiveMenuId(null)}/>
                                                    <div
                                                        className="relative w-full max-w-sm sm:w-72 card-theme rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                        <div
                                                            className="flex items-center gap-3 p-4 border-b border-gray-100">
                                                            <img src={order.image} alt=""
                                                                 className="w-12 h-12 rounded-full object-cover border border-gray-100"/>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-[var(--header-text)] truncate">{order.first_name} {order.last_name}</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{order.message}</p>
                                                            </div>
                                                            <span
                                                                className="text-xs text-gray-400 whitespace-nowrap self-start">{order.time}</span>
                                                        </div>
                                                        <div className="p-1">
                                                            <button onClick={() => handleDelete(order.id)}
                                                                    className="flex items-start gap-3 w-full p-3 hover:bg-red-50 rounded-lg">
                                                                <Trash2 className="text-red-500 cursor-pointer"
                                                                        size={20}/>
                                                                <div className="text-left">
                                                                    <p className="text-sm font-semibold text-red-600 cursor-pointer">Delete
                                                                        this notification</p>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-2">
                                                <div
                                                    className="font-bold text-sm sm:text-base text-emerald-400">${order.total}</div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between mt-2 gap-2">
                                                <span
                                                    className="text-[11px] sm:text-xs text-gray-400">{order.time}</span>
                                                <button onClick={() => handleViewDetails(order.id)}
                                                        className="text-xs sm:text-sm font-semibold text-blue-600 hover:underline cursor-pointer">
                                                    Review →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!isSearching && notifications.length > 4 && !showAll && (
                                    <button onClick={() => setShowAll(true)}
                                            className="w-full py-3 mt-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200 cursor-pointer">
                                        See More ({notifications.length - 4} more)
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div
                                className="flex flex-col py-20 text-center text-gray-400 italic text-[14px] items-center gap-3">
                                <Bell className="w-12 h-12 text-gray-300"/>
                                <span>No notifications found</span>
                            </div>
                        )
                    ) : (
                        selectedOrder && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                                        <img src={selectedOrder.image} className="w-full h-full object-cover" alt={""}/>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[var(--header-text)]">{selectedOrder.first_name} {selectedOrder.last_name}</h3>
                                        <p className="text-sm text-gray-500">{selectedOrder.email}</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl card-theme border border-gray-100 dark:border-white/10">
                                    <h4 className="font-bold text-[var(--header-text)] mb-4">Ordered Items</h4>
                                    <div className="space-y-4">
                                        {selectedOrder.products.map((p, i) => (
                                            <div key={i} className="flex gap-4 items-center">
                                                <div
                                                    className="w-16 h-16 card-theme rounded-lg overflow-hidden bg-gray-100">
                                                    <img src={p.image} className="w-full h-full object-cover" alt={""}/>
                                                </div>
                                                <div className="flex-1 text-sm">
                                                    <p className="text-[14px] md:text-[16px] font-bold text-[var(--header-text)]">{p.name}</p>
                                                    <p className="text-gray-500">Qty: {p.qty} | Size: {p.size} |
                                                        Color: {p.color}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div
                                        className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                                        <span
                                            className="text-[11px] sm:text-xs text-gray-400">{selectedOrder.time}</span>
                                        <div className="text-right">
                                            <p className="text-sm sm:text-base text-gray-500">Total Amount</p>
                                            <p className="text-xl sm:text-2xl font-bold text-emerald-500">
                                                ${selectedOrder.total}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationDrawer;