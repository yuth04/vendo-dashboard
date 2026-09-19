import { apiClient } from "@/src/app/components/services/api/apiClient";
import {ApiResponse} from "@/src/app/components/services/utils/models";
import {ENDPOINTS} from "@/src/app/components/modules/settings/categories/core/api/endpoints";
import {CategoryListResponse} from "@/src/app/components/modules/settings/categories/core/models/categoriesModel";


export const categoriesClient = {

    fetchCategories: async (signal?: AbortSignal): Promise<ApiResponse<CategoryListResponse>> =>
        apiClient.get(ENDPOINTS.categories, { signal }),

    createCategory: async (formData: FormData): Promise<ApiResponse<any>> => {
        return apiClient.post(ENDPOINTS.admincategories, formData);
    },

    fetchCategoryById: async (id: string | number, signal?: AbortSignal): Promise<ApiResponse<any>> => {
        const url = `${ENDPOINTS.categories}/${id}`;
        return apiClient.get(url, { signal });
    },

    fetchParentCategories: async (signal?: AbortSignal) => {
        return apiClient.get(ENDPOINTS.parentcategory, { signal });
    },


    updateCategory: async (formData: FormData, id: string | number): Promise<ApiResponse<any>> => {
        const url = `${ENDPOINTS.admincategories}/${id}`;
        return apiClient.post(url, formData);
    },

    deleteCategory: async (id: string | number): Promise<ApiResponse<any>> => {
        const url = `${ENDPOINTS.admincategories}/${id}`;
        return apiClient.delete(url);
    },

};