import { apiClient } from "@/src/app/components/services/api/apiClient";
import { ApiResponse } from "@/src/app/components/services/utils/models";
import {User, UserListResponse} from "@/src/app/components/modules/customers/core/models/customerModel";
import {ENDPOINTS} from "@/src/app/components/modules/customers/core/api/endpoints";



export const customersClient = {

    fetchUsers: async (signal?: AbortSignal): Promise<ApiResponse<UserListResponse>> =>
        apiClient.get(ENDPOINTS.users, { signal }),

    fetchUserById: async (id: string, signal?: AbortSignal): Promise<ApiResponse<UserListResponse>> =>
        apiClient.get(`${ENDPOINTS.users}/${id}`, { signal }),

    updateUser: async (id: number, data: Partial<User>): Promise<ApiResponse<any>> =>
        apiClient.post(`${ENDPOINTS.users}/${id}`, data),

    updateUserStatus: async (id: number, status: string, currentUser: User): Promise<ApiResponse<any>> =>
        apiClient.post(`${ENDPOINTS.users}/${id}`, {
            first_name: currentUser.first_name,
            last_name: currentUser.last_name,
            email: currentUser.email,
            role: currentUser.role,
            status: status,
        }),

    updateUserRole: async (id: number, role: string): Promise<ApiResponse<any>> =>
        apiClient.put(`${ENDPOINTS.usersrole}/${id}`, { role }),

    deleteUser: async (id: string | number): Promise<ApiResponse<any>> =>
        apiClient.delete(`${ENDPOINTS.users}/${id}`),


    exportCustomersExcel: async (): Promise<ApiResponse<Blob>> =>
        apiClient.get(ENDPOINTS.customersexcel, { responseType: 'blob' }),

    exportCustomersPdf: async (): Promise<ApiResponse<Blob>> =>
        apiClient.get(ENDPOINTS.customerspdf, { responseType: 'blob' }),

};