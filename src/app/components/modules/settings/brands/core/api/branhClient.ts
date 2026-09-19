import { apiClient } from "@/src/app/components/services/api/apiClient";
import { ApiResponse } from "@/src/app/components/services/utils/models";
import {BrandDetailResponse, BrandListResponse} from "@/src/app/components/modules/settings/brands/core/models/brandModel";
import {ENDPOINTS} from "@/src/app/components/modules/settings/brands/core/api/endpoints";


export const brandClient = {

    fetchBrands: async (signal?: AbortSignal): Promise<ApiResponse<BrandListResponse>> =>
        apiClient.get(ENDPOINTS.brands, { signal }),

    fetchBrandById: async (id: number, signal?: AbortSignal): Promise<ApiResponse<BrandDetailResponse>> =>
        apiClient.get(`${ENDPOINTS.brands}/${id}`, { signal }),

    createBrand: async (formData: FormData): Promise<ApiResponse<any>> =>
        apiClient.post(ENDPOINTS.adminbrands, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    updateBrand: async (id: number, formData: FormData): Promise<ApiResponse<any>> =>
        apiClient.post(`${ENDPOINTS.adminbrands}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    deleteBrand: async (id: number): Promise<ApiResponse<any>> =>
        apiClient.delete(`${ENDPOINTS.adminbrands}/${id}`),
};