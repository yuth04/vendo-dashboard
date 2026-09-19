import { apiClient } from "@/src/app/components/services/api/apiClient";
import { ApiResponse } from "@/src/app/components/services/utils/models";
import {OrderHistoryResponse} from "@/src/app/components/modules/history-orders/core/models/historyOrderModel";
import {ENDPOINTS} from "@/src/app/components/modules/history-orders/core/api/endpoints";


export const orderhistoryClient = {

    fetchOrderHistory: async (signal?: AbortSignal): Promise<ApiResponse<OrderHistoryResponse>> =>
        apiClient.get(ENDPOINTS.orderhistory, { signal }),

    fetchOrderDetails: async (id: number): Promise<ApiResponse<any>> =>
        apiClient.get(`${ENDPOINTS.orderdetails}/${id}`),

    exportOrders: async (): Promise<ApiResponse<Blob>> =>
        apiClient.get(ENDPOINTS.ordersexport, {
            responseType: 'blob'
        }),

    fetchOrderPdf: async (): Promise<ApiResponse<Blob>> =>
        apiClient.get(ENDPOINTS.orderspdf, {
            responseType: 'blob'
        }),
};