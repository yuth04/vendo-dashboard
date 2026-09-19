'use client';

import React from 'react';
import { OrderHistoryItem } from "@/src/app/components/modules/online-orders/core/models/onlineOrdersModel";

export const onlineOrdersService = {
    /**
     * Determines whether an API response structure represents a positive resolution.
     */
    isSuccess: (res: any): boolean => {
        return !!(res && (res.order || res.message || res.data) && !res.error);
    },

    /**
     * Resolves matching Tailwind borders and text weight pairings for order statuses.
     */
    getStatusStyles: (status: string): string => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
            case 'CANCELLED': return 'bg-red-50 text-red-500 border-red-100';
            case 'PENDING': return 'bg-orange-50 text-orange-500 border-orange-100';
            case 'CONFIRMED':
            case 'PROCESSING': return 'bg-blue-50 text-blue-500 border-blue-100';
            case 'SHIPPING': return 'bg-violet-50 text-violet-500 border-violet-100';
            case 'DELIVERED': return 'bg-cyan-50 text-cyan-500 border-cyan-100';
            case 'RETURN REQUESTED': return 'bg-amber-50 text-amber-500 border-amber-100';
            case 'RETURNED': return 'bg-rose-50 text-rose-500 border-rose-100';
            default: return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    },

    /**
     * Resolves layout accent blocks mapping back to raw transactional invoice values.
     */
    getPaymentStyles: (payment: string): string => {
        switch (payment?.toUpperCase()) {
            case 'PAID': return 'bg-emerald-50 text-emerald-500';
            case 'UNPAID': return 'bg-red-50 text-red-500';
            case 'REFUNDED': return 'bg-gray-100 text-gray-500';
            default: return 'bg-gray-50 text-gray-400';
        }
    },

    /**
     * Filters order array context matching multi-layered query constraints.
     */
    filterOrders: (
        orders: OrderHistoryItem[],
        searchTerm: string,
        statusFilter: string,
        paymentFilter: string
    ): OrderHistoryItem[] => {
        const query = searchTerm.toLowerCase().trim();

        return orders.filter(order => {
            const matchesSearch = !query ||
                (order.order_number && order.order_number.toLowerCase().includes(query)) ||
                (order.first_name && order.first_name.toLowerCase().includes(query)) ||
                (order.last_name && order.last_name.toLowerCase().includes(query)) ||
                (order.email && order.email.toLowerCase().includes(query));

            const matchesStatus = statusFilter === 'All Statuses' ||
                order.status?.toLowerCase() === statusFilter.toLowerCase();

            const matchesPayment = paymentFilter === 'All Payments' ||
                order.payment?.toLowerCase() === paymentFilter.toLowerCase();

            return matchesSearch && matchesStatus && matchesPayment;
        });
    },

    /**
     * Cuts active workspace indices mapping perfectly onto target rows per viewport view.
     */
    getCurrentPageOrders: (
        orders: OrderHistoryItem[],
        currentPage: number,
        itemsPerPage: number
    ): OrderHistoryItem[] => {
        const start = (currentPage - 1) * itemsPerPage;
        return orders.slice(start, start + itemsPerPage);
    },

    /**
     * Compiles dynamic scalar ranges mapping pagination sequences safely.
     */
    getPageNumbers: (totalItems: number, itemsPerPage: number): number[] => {
        const pages = Math.ceil(totalItems / itemsPerPage);
        return Array.from({ length: pages || 1 }, (_, i) => i + 1);
    },

    /**
     * Safely aggregates subtotal values from item details lists.
     */
    calculateSubtotal: (items?: any[]): number => {
        if (!items) return 0;
        return items.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);
    },

    /**
     * Parses a text value safely into an explicit layout coordinate floating-point value.
     */
    parseShippingFee: (fee?: string | null): number => {
        if (!fee) return 0;
        return parseFloat(fee) || 0;
    },

    /**
     * Integrates base metrics computing invoice targets.
     */
    calculateTotal: (subtotal: number, shippingFee: number): number => {
        return subtotal + shippingFee;
    },

    /**
     * Unwraps order payload context out of inconsistent structure fields cleanly.
     */
    unwrapOrderDetails: (response: any): any => {
        return response?.data?.data || response?.data || null;
    }
};