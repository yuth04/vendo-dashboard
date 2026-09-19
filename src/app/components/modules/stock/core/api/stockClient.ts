import { apiClient } from "@/src/app/components/services/api/apiClient";
import { ApiResponse } from "@/src/app/components/services/utils/models";
import {CategoryListResponse, VariantListResponse} from "@/src/app/components/modules/stock/core/models/stockModel";
import {ENDPOINTS} from "@/src/app/components/modules/stock/core/api/endponints";


export const stockClient = {

    fetchCategories: async (signal?: AbortSignal): Promise<ApiResponse<CategoryListResponse>> =>
        apiClient.get(ENDPOINTS.categories, { signal }),

    fetchVariants: async (signal?: AbortSignal): Promise<ApiResponse<VariantListResponse>> =>
        apiClient.get(ENDPOINTS.variants, { signal }),

    updateVariant: async (id: number, stock: number): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('stock', stock.toString());
        return apiClient.post(`${ENDPOINTS.adminproductvariants}/${id}`, formData);
    },

    deleteProductVariant: async (id: number): Promise<ApiResponse<any>> =>
        apiClient.delete(`${ENDPOINTS.adminproductvariants}/${id}`),


    exportStocksExcel: async (): Promise<ApiResponse<Blob>> => {
        return await apiClient.get(ENDPOINTS.stocksexcel, {
            responseType: 'blob'
        });
    },

    exportStocksPdf: async (): Promise<ApiResponse<Blob>> => {
        return await apiClient.get(ENDPOINTS.stockspdf, {
            responseType: 'blob'
        });
    },
};