import { apiClient } from "@/src/app/components/services/api/apiClient";
import {ApiResponse} from "@/src/app/components/services/utils/models";
import {
    ParentCategoryResponse
} from "@/src/app/components/modules/settings/parentcategory/core/models/parentCategoriesModel";
import {ENDPOINTS} from "@/src/app/components/modules/settings/parentcategory/core/api/endpoints";






export const parentcategoriesClient = {

    fetchParentcategories: async (signal?: AbortSignal): Promise<ApiResponse<ParentCategoryResponse>> =>
        apiClient.get(ENDPOINTS.parentcategory, { signal }),

    createParentcategory: async (data: { name: string; status: boolean }): Promise<ApiResponse<any>> =>
        apiClient.post(ENDPOINTS.adminparentcategories.trim(), data),

    updateParentcategory: async (id: number, data: { name: string; status: any }): Promise<ApiResponse<any>> => {
        const url = `${ENDPOINTS.adminparentcategories.trim()}/${id}`;
        return apiClient.put(url, data);
    },

    deleteParentcategory: async (id: number): Promise<ApiResponse<any>> => {
        const url = `${ENDPOINTS.adminparentcategories.trim()}/${id}`;
        return apiClient.delete(url);
    },

    fetchParentcategoryById: async (id: number): Promise<ApiResponse<any>> => {
        const url = `${ENDPOINTS.parentcategory.trim()}/${id}`;
        return apiClient.get(url);
    },

};