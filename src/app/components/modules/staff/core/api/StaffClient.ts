import { apiClient } from "@/src/app/components/services/api/apiClient";
import { ApiResponse } from "@/src/app/components/services/utils/models";
import { Staff, StaffListResponse } from "@/src/app/components/modules/staff/core/models/StaffModel";
import { Endpoints } from "@/src/app/components/modules/staff/core/api/Endpoints";

export const StaffClient = {

    fetchStaffs: async (signal?: AbortSignal): Promise<ApiResponse<StaffListResponse>> =>
        apiClient.get(Endpoints.staffs, { signal }),

    fetchStaffById: async (id: string, signal?: AbortSignal): Promise<ApiResponse<any>> =>
        apiClient.get(`${Endpoints.staffs}/${id}`, { signal }),

    updateStaff: async (id: number, data: Partial<Staff>): Promise<ApiResponse<any>> =>
        apiClient.post(`${Endpoints.staffupdate}/${id}`, data),

    updateStaffStatus: async (id: number, status: string, currentUser: Staff): Promise<ApiResponse<any>> =>
        apiClient.post(`${Endpoints.staffupdate}/${id}`, {
            first_name: currentUser.first_name,
            last_name: currentUser.last_name,
            email: currentUser.email,
            role: currentUser.role,
            status: status,
        }),

    updateStaffRole: async (id: number, role: string): Promise<ApiResponse<any>> =>
        apiClient.put(`${Endpoints.staffrole}/${id}`, { role }),

    deleteStaff: async (id: string | number): Promise<ApiResponse<any>> =>
        apiClient.delete(`${Endpoints.staffupdate}/${id}`),


    //----export------//
    exportStaffsExcel: async (): Promise<ApiResponse<Blob>> =>
        apiClient.get(Endpoints.staffsexcel, { responseType: 'blob' }),

    exportStaffsPdf: async (): Promise<ApiResponse<Blob>> =>
        apiClient.get(Endpoints.staffspdf, { responseType: 'blob' }),

};