import {ApiResponse} from "@/src/app/components/services/utils/models";
import {ENDPOINTS} from "@/src/app/components/modules/settings/account-info/core/api/endpoints";
import {apiClient} from "@/src/app/components/services/api/apiClient";



export const accountInfoClient = {
    updatenameusers: async (data: { first_name: string; last_name: string }): Promise<ApiResponse<any>> =>
        apiClient.put(ENDPOINTS.changename, data),

    updatepassword: async (data: any): Promise<ApiResponse<any>> =>
        apiClient.put(ENDPOINTS.changepassword, data),

    updateProfileImage: async (file: File): Promise<ApiResponse<any>> => {
        const formData = new FormData();
        formData.append('image', file);

        return apiClient.post(ENDPOINTS.changeimageprofile, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};