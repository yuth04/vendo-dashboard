import { apiClient } from "@/src/app/components/services/api/apiClient";
import {ApiResponse} from "@/src/app/components/services/utils/models";
import {
    ReturnDetailResponse,
    ReturnHistoryResponse
} from "@/src/app/components/modules/customer-return/core/models/customerReturnModel";
import {ENDPOINTS} from "@/src/app/components/modules/customer-return/core/api/endpoints";


export const customerrturnClient = {
    fetchCustomerReturn: async (signal?: AbortSignal): Promise<ApiResponse<ReturnHistoryResponse>> =>
        apiClient.get(ENDPOINTS.returns, { signal }),

    fetchReturnDetails: async (id: string | number, signal?: AbortSignal): Promise<ApiResponse<ReturnDetailResponse>> =>
        apiClient.get(`${ENDPOINTS.returndetails}/${id}`, { signal }),

    approveReturn: async (id: number | string): Promise<ApiResponse<any>> =>
        apiClient.patch(`${ENDPOINTS.returnsapprove}/${id}`),

    completeReturn: async (id: number | string): Promise<ApiResponse<any>> =>
        apiClient.patch(`${ENDPOINTS.returnscomplete}/${id}`),

    rejectReturn: async (id: number | string): Promise<ApiResponse<any>> =>
        apiClient.patch(`${ENDPOINTS.returnsreject}/${id}`),

    exportReturnHistory: async (): Promise<ApiResponse<Blob>> => {
        return await apiClient.get(ENDPOINTS.returnhistoryexel, {
            responseType: 'blob'
        });
    },

    exportReturnHistoryPdf: async (): Promise<ApiResponse<Blob>> => {
        return await apiClient.get(ENDPOINTS.returnhistorypdf, {
            responseType: 'blob'
        });
    },
};

