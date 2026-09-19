import { apiClient } from "@/src/app/components/services/api/apiClient";
import { ApiResponse } from "@/src/app/components/services/utils/models";
import {DamageResponse} from "@/src/app/components/modules/damage/core/models/damageModel";
import {ENDPOINTS} from "@/src/app/components/modules/damage/core/api/endpoints";



export const productdamagesClient = {

    fetchProductDamages: async (signal?: AbortSignal): Promise<ApiResponse<DamageResponse>> =>
        apiClient.get(ENDPOINTS.productdamages, { signal }),

    addProductDamage: async (data: FormData): Promise<ApiResponse<DamageResponse>> => {
        return apiClient.post(ENDPOINTS.productdamages, data);
    },

    updateProductDamage: async (id: number | string, data: FormData): Promise<ApiResponse<DamageResponse>> => {
        return apiClient.post(`${ENDPOINTS.productdamages}/${id}`, data);
    },

    deleteProductDamage: async (id: number | string): Promise<ApiResponse<any>> => {
        return apiClient.delete(`${ENDPOINTS.productdamages}/${id}`);
    },

    exportProductDamages: async (): Promise<any> => {
        return await apiClient.get(ENDPOINTS.damagesexcel, {
            responseType: 'blob'
        });
    },

    exportProductDamagesPdf: async (): Promise<any> => {
        return await apiClient.get(ENDPOINTS.damagespdf, {
            responseType: 'blob'
        });
    },
};