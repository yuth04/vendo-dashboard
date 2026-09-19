'use client';

import { ReturnItem } from "@/src/app/components/modules/customer-return/core/models/customerReturnModel";

export const customerReturnService = {
    /**
     * Resolves layout accent blocks mapping status states back to Tailwind utilities.
     * Supports both summary listing statuses and specific deep detail view statuses.
     */
    getStatusStyles: (status: string | undefined): string => {
        const lowerStatus = status?.toLowerCase();
        if (lowerStatus === 'requested') return 'bg-amber-50 text-amber-500 border-amber-100';
        if (lowerStatus === 'approved') return 'bg-blue-50 text-blue-500 border-blue-100';
        if (lowerStatus === 'rejected') return 'bg-red-50 text-red-500 border-red-100';
        if (lowerStatus === 'completed' || lowerStatus === 'refunded') return 'bg-emerald-50 text-emerald-500 border-emerald-100';
        return 'bg-emerald-50 text-emerald-500 border-emerald-100';
    },

    /**
     * Filters return record lists matching real-time input queries and dropdown tokens.
     */
    filterReturns: (
        returns: ReturnItem[],
        searchTerm: string,
        statusFilter: string
    ): ReturnItem[] => {
        if (!Array.isArray(returns)) return [];

        const query = searchTerm.toLowerCase().trim();

        return returns.filter(item => {
            const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
            const matchesSearch = !query ||
                item.order_number?.toLowerCase().includes(query) ||
                fullName.includes(query) ||
                item.email?.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === 'All Status' ||
                item.status?.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    },

    /**
     * Resolves the proper binary file configuration headers based on target file formats.
     */
    getExportBlobType: (type: 'excel' | 'pdf'): string => {
        return type === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf';
    }
};