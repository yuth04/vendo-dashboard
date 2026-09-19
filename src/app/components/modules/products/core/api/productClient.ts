import { apiClient } from "@/src/app/components/services/api/apiClient";
import { ApiResponse } from "@/src/app/components/services/utils/models";
import {
    CategoryListResponse,
    ProductListResponse, VariantListResponse
} from "@/src/app/components/modules/products/core/models/productModel";
import {ENDPOINTS} from "@/src/app/components/modules/products/core/api/endponints";


export const productClient = {

    fetchProducts: async (signal?: AbortSignal): Promise<ApiResponse<ProductListResponse>> =>
        apiClient.get(ENDPOINTS.products, { signal }),

    fetchProductById: async (id: number): Promise<ApiResponse<any>> => {
        return apiClient.get(`${ENDPOINTS.products}/${id}`);
    },

    fetchCategories: async (signal?: AbortSignal): Promise<ApiResponse<CategoryListResponse>> =>
        apiClient.get(ENDPOINTS.categories, { signal }),

    fetchBrands: async (signal?: AbortSignal): Promise<ApiResponse<any>> =>
        apiClient.get(ENDPOINTS.brands, { signal }),

    fetchVariants: async (signal?: AbortSignal): Promise<ApiResponse<VariantListResponse>> =>
        apiClient.get(ENDPOINTS.variants, { signal }),

    fetchVariantById: async (id: number, signal?: AbortSignal): Promise<ApiResponse<any>> =>
        apiClient.get(`${ENDPOINTS.variants}/${id}`, { signal }),

    createProduct: async (data: FormData): Promise<ApiResponse<any>> =>
        apiClient.post(ENDPOINTS.adminproducts, data),

    createProductVariant: async (data: FormData): Promise<ApiResponse<any>> =>
        apiClient.post(ENDPOINTS.adminproductvariants, data),


    updateProduct: async (id: number, data: FormData): Promise<ApiResponse<any>> => {
        return apiClient.post(`${ENDPOINTS.adminproducts}/${id}`, data);
    },

    updateProductVariant: async (id: number, data: FormData): Promise<ApiResponse<any>> => {
        return apiClient.post(`${ENDPOINTS.adminproductvariants}/${id}`, data);
    },

    deleteProductVariant: async (id: number): Promise<ApiResponse<any>> =>
        apiClient.delete(`${ENDPOINTS.adminproductvariants}/${id}`),

    deleteProduct: async (id: number): Promise<ApiResponse<any>> =>
        apiClient.delete(`${ENDPOINTS.adminproducts}/${id}`),

    exportProducts: async (): Promise<ApiResponse<Blob>> => {
        return await apiClient.get(ENDPOINTS.productsexport, {
            responseType: 'blob'
        });
    },

    exportProductsPdf: async (): Promise<ApiResponse<Blob>> => {
        return await apiClient.get(ENDPOINTS.productsexportpdf, {
            responseType: 'blob'
        });
    },
};