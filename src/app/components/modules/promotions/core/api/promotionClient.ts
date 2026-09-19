import { apiClient } from "@/src/app/components/services/api/apiClient";
import { ApiResponse } from "@/src/app/components/services/utils/models";
import {PromotionResponse} from "@/src/app/components/modules/promotions/core/models/promotionModel";
import {ENDPOINTS} from "@/src/app/components/modules/promotions/core/api/endpoints";



export const promotionClient = {

    fetchPromotions: async (signal?: AbortSignal): Promise<ApiResponse<PromotionResponse>> =>
        apiClient.get(ENDPOINTS.admindiscounts, { signal }),

    fetchPromotionById: async (id: number, signal?: AbortSignal): Promise<ApiResponse<any>> =>
        apiClient.get(`${ENDPOINTS.admindiscounts}/${id}`, { signal }),

    deleteDiscount: async (id: number): Promise<ApiResponse<any>> =>
        apiClient.delete(`${ENDPOINTS.admindiscounts}/${id}`),

    createPromotion: async (formData: FormData): Promise<ApiResponse<any>> =>
        apiClient.post(ENDPOINTS.admindiscounts, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    updatePromotion: async (id: number, formData: FormData): Promise<ApiResponse<any>> =>
        apiClient.post(`${ENDPOINTS.admindiscounts}/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }),

    addProductsToDiscount: async (payload: { discount_id: string; product_ids: number[] }): Promise<ApiResponse<any>> =>
        apiClient.post(ENDPOINTS.addproducts, payload),


    removeProductFromDiscount: async (id: number): Promise<ApiResponse<any>> =>
        apiClient.delete(`${ENDPOINTS.removeproduct}/${id}`),
};