import { apiClient } from "@/src/app/components/services/api/apiClient";
import {ENDPOINTS} from "@/src/app/components/modules/admin/core/api/endpoints";
import {ApiResponse} from "@/src/app/components/services/utils/models";
import {Admin, AdminListResponse} from "@/src/app/components/modules/admin/core/models/adminModel";




export const adminClient = {

    fetchAdmins: async (signal?: AbortSignal): Promise<ApiResponse<AdminListResponse>> =>
        apiClient.get(ENDPOINTS.adminroles, { signal }),

    fetchAdminById: async (id: string, signal?: AbortSignal): Promise<ApiResponse<AdminListResponse>> =>
        apiClient.get(`${ENDPOINTS.adminroles}/${id}`, { signal }),

    updateAdmin: async (id: number, data: Partial<Admin>): Promise<ApiResponse<any>> =>
        apiClient.post(`${ENDPOINTS.admins}/${id}`, data),

    updateAdminStatus: async (id: number, status: string, currentUser: Admin): Promise<ApiResponse<any>> =>
        apiClient.post(`${ENDPOINTS.admins}/${id}`, {
            first_name: currentUser.first_name,
            last_name: currentUser.last_name,
            email: currentUser.email,
            role: currentUser.role,
            status: status,
        }),

    updateAdminRole: async (id: number, role: string): Promise<ApiResponse<any>> =>
        apiClient.put(`${ENDPOINTS.adminrole}/${id}`, { role }),

    deleteAdmin: async (id: string | number): Promise<ApiResponse<any>> =>
        apiClient.delete(`${ENDPOINTS.admins}/${id}`),


    //----export------//
    exportAdminsExcel: async (): Promise<ApiResponse<Blob>> =>
        apiClient.get(ENDPOINTS.adminsexcel, { responseType: 'blob' }),

    exportAdminsPdf: async (): Promise<ApiResponse<Blob>> =>
        apiClient.get(ENDPOINTS.adminspdf, { responseType: 'blob' }),

};