'use client';

import { OrderHistoryItem, OrderDetailsData } from "@/src/app/components/modules/history-orders/core/models/historyOrderModel";

export const historyOrderService = {
    /**
     * Filters orders based on a search term match against number, first name, last name, and a status filter.
     */
    filterOrders: (orders: OrderHistoryItem[], searchTerm: string, statusFilter: string): OrderHistoryItem[] => {
        return orders.filter(order => {
            const matchesSearch =
                order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.last_name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === "All Statuses" ||
                order.status.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    },

    /**
     * Slices the list of filtered orders down to the items designated for the current visible page block.
     */
    getCurrentPageOrders: (orders: OrderHistoryItem[], page: number, itemsPerPage: number): OrderHistoryItem[] => {
        const totalPages = Math.ceil(orders.length / itemsPerPage);
        const safePage = Math.min(page, totalPages || 1);

        const indexOfLastItem = safePage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return orders.slice(indexOfFirstItem, indexOfLastItem);
    },

    /**
     * Computes total pagination pages array block based on total items found.
     */
    getPageNumbers: (totalItems: number, itemsPerPage: number): number[] => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    },

    /**
     * Returns matching background/text combination template based on current order step status text.
     */
    getStatusStyles: (status: string): string => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED':        return 'bg-emerald-50 text-emerald-500 border-emerald-100';
            case 'CANCELLED':        return 'bg-red-50 text-red-500 border-red-100';
            case 'PENDING':          return 'bg-orange-50 text-orange-500 border-orange-100';
            case 'CONFIRMED':
            case 'PROCESSING':       return 'bg-blue-50 text-blue-500 border-blue-100';
            case 'SHIPPING':         return 'bg-violet-50 text-violet-500 border-violet-100';
            case 'DELIVERED':        return 'bg-cyan-50 text-cyan-500 border-cyan-100';
            case 'RETURN REQUESTED': return 'bg-amber-50 text-amber-500 border-amber-100';
            default:                 return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    },

    /**
     * Extracts and safe parses order record parameters from endpoint payload results.
     */
    extractOrderDetails: (res: any): OrderDetailsData | null => {
        return res?.data?.data || res?.data || null;
    },

    /**
     * Computes cumulative costs of all purchased line-items.
     */
    calculateSubtotal: (order: OrderDetailsData | null): number => {
        if (!order || !order.items) return 0;
        return order.items.reduce((acc, i) => acc + (Number(i.subtotal) || 0), 0);
    },

    /**
     * Safely reads and converts dynamic shipping charge metadata variables.
     */
    parseShippingFee: (order: OrderDetailsData | null): number => {
        if (!order) return 0;
        return parseFloat(order.shipping_fee || "0");
    },

    /**
     * Aggregates line subtotal value blocks with parsed logistics shipping estimates.
     */
    calculateTotal: (order: OrderDetailsData | null): number => {
        const subtotal = historyOrderService.calculateSubtotal(order);
        const shipping = historyOrderService.parseShippingFee(order);
        return subtotal + shipping;
    },

    /**
     * Evaluates verification values tracking specific transactional payment step states.
     */
    checkIsPaid: (order: OrderDetailsData | null): boolean => {
        if (!order) return false;
        return order.payment_status?.toUpperCase() === 'PAID';
    }
};