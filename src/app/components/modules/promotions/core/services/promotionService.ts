'use client';

import { promotionClient } from "@/src/app/components/modules/promotions/core/api/promotionClient";
import { PromotionResponse } from "@/src/app/components/modules/promotions/core/models/promotionModel";
import { ApiResponse } from "@/src/app/components/services/utils/models";

export const promotionService = {
    /**
     * Fetch all promotions and campaigns
     */
    fetchPromotions: async (signal?: AbortSignal): Promise<ApiResponse<PromotionResponse>> => {
        return await promotionClient.fetchPromotions(signal);
    },

    /**
     * Fetch a specific single promotion details by its ID
     */
    fetchPromotionById: async (id: number): Promise<ApiResponse<any>> => {
        return await promotionClient.fetchPromotionById(id);
    },

    /**
     * Create a new promotion campaign
     */
    createPromotion: async (formData: FormData): Promise<ApiResponse<any>> => {
        return await promotionClient.createPromotion(formData);
    },

    /**
     * Link selected products to a specific discount promotion campaign
     */
    addProductsToDiscount: async (payload: { discount_id: string; product_ids: number[] }): Promise<ApiResponse<any>> => {
        return await promotionClient.addProductsToDiscount(payload);
    },

    /**
     * Update an existing promotion campaign
     */
    updatePromotion: async (id: number | string, formData: FormData): Promise<ApiResponse<any>> => {
        // FIXED: Explicitly casting id using Number() to fulfill the strict 'number' type definition expected by promotionClient
        return await promotionClient.updatePromotion(Number(id), formData);
    },

    /**
     * Delete a full specific discount campaign
     */
    deleteDiscount: async (id: number): Promise<ApiResponse<any>> => {
        return await promotionClient.deleteDiscount(id);
    },

    /**
     * Remove a targeted single product out of an ongoing discount campaign
     */
    removeProductFromDiscount: async (productId: number): Promise<ApiResponse<any>> => {
        return await promotionClient.removeProductFromDiscount(productId);
    }
};