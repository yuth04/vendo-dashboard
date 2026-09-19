'use client';

import { ApiResponse } from "@/src/app/components/services/utils/models";
import { couponClient } from "@/src/app/components/modules/coupons/core/api/couponClient";

export const couponService = {
    /**
     * Fetches all discount coupon profiles wrapped inside standard data structures.
     */
    async fetchCoupons(signal?: AbortSignal): Promise<ApiResponse<any>> {
        try {
            const response = await couponClient.fetchCoupons(signal);
            if (response && response.date) {
                return { data: response.date, error: null };
            }
            return { data: [], error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "Failed to fetch coupons data layout payload." }
            };
        }
    },

    /**
     * Fetches a specific detailed coupon configuration record by its unique identifier.
     */
    async fetchCouponById(id: string | number): Promise<ApiResponse<any>> {
        try {
            const response = await couponClient.fetchCouponById(id);
            // Accounts for typo 'date' from the underlying client response object
            if (response && response.date) {
                return { data: response.date, error: null };
            }
            return { data: response?.date || null, error: response?.error || null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "Failed to find individual coupon reference configuration." }
            };
        }
    },

    /**
     * Creates a new unique coupon structure configuration.
     */
    async createCoupon(data: FormData): Promise<ApiResponse<any>> {
        try {
            const response = await couponClient.createCoupon(data);
            return { data: response?.data || null, error: response?.error || null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "An error occurred creating coupon specifications." }
            };
        }
    },

    /**
     * Updates an individual coupon's schema structure via form binary parameters.
     */
    async updateCoupon(id: string | number, data: FormData): Promise<ApiResponse<any>> {
        try {
            const response = await couponClient.updateCoupon(id, data);
            return { data: response?.data || null, error: response?.error || null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "An error occurred updating coupon parameters." }
            };
        }
    },

    /**
     * Purges an individual coupon specification structure record from database.
     */
    async deleteCoupon(id: string | number): Promise<ApiResponse<any>> {
        try {
            const response = await couponClient.deleteCoupon(id);
            return { data: response?.data || null, error: response?.error || null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "An error occurred purging coupon record layout." }
            };
        }
    }
};