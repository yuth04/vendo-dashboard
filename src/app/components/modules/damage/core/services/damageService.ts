'use client';

import { ApiResponse } from "@/src/app/components/services/utils/models";
import { productdamagesClient } from "@/src/app/components/modules/damage/core/api/damageClient";

export const damageService = {
    /**
     * Fetches all registered product damage profile tracking schemas.
     */
    async fetchProductDamages(signal?: AbortSignal): Promise<ApiResponse<any>> {
        try {
            const response = await productdamagesClient.fetchProductDamages(signal);
            if (response && response.data) {
                return { data: response.data, error: null };
            }
            return { data: { data: [] }, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "Failed to retrieve damaged inventory layout payload." }
            };
        }
    },

    /**
     * Creates a new product damage record report.
     */
    async addProductDamage(formData: FormData): Promise<ApiResponse<any>> {
        try {
            const response = await productdamagesClient.addProductDamage(formData);
            return { data: response?.data || null, error: response?.error || null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "An unexpected error occurred while creating the damage log." }
            };
        }
    },

    /**
     * Updates an existing product damage log entry scheme by ID.
     */
    async updateProductDamage(id: number | string, formData: FormData): Promise<ApiResponse<any>> {
        try {
            const response = await productdamagesClient.updateProductDamage(id, formData);
            return { data: response?.data || null, error: response?.error || null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "An unexpected error occurred updating the damage log." }
            };
        }
    },

    /**
     * Deletes a specific product damage log report record by ID.
     */
    async deleteProductDamage(id: number | string): Promise<ApiResponse<any>> {
        try {
            const response = await productdamagesClient.deleteProductDamage(id);
            return { data: response?.data || null, error: response?.error || null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "An error occurred purging product damage log record." }
            };
        }
    },

    /**
     * Exports inventory damages profile details to spreadsheet binary.
     */
    async exportProductDamages(): Promise<ApiResponse<any>> {
        try {
            const response = await productdamagesClient.exportProductDamages();
            if (response && response.data) {
                return { data: response.data, error: null };
            }
            return { data: null, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "An error occurred processing spreadsheet document export." }
            };
        }
    },

    /**
     * Exports inventory damages profile details to portable document binary format (PDF).
     */
    async exportProductDamagesPdf(): Promise<ApiResponse<any>> {
        try {
            const response = await productdamagesClient.exportProductDamagesPdf();
            if (response && response.data) {
                return { data: response.data, error: null };
            }
            return { data: null, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "An error occurred processing document compilation report." }
            };
        }
    }
};