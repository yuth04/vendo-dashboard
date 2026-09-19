import { apiClient } from "@/src/app/components/services/api/apiClient";
import {OrderHistoryResponse} from "@/src/app/components/modules/online-orders/core/models/onlineOrdersModel";
import {ENDPOINTS} from "@/src/app/components/modules/online-orders/core/api/endpoints";
import {ApiResponse} from "@/src/app/components/services/utils/models";

export const onlineorderClient = {

    fetchOrderHistory: async (signal?: AbortSignal): Promise<ApiResponse<OrderHistoryResponse>> =>
        apiClient.get(ENDPOINTS.onlineorder, { signal }),

    fetchOrderDetails: async (id: number): Promise<ApiResponse<any>> =>
        apiClient.get(`${ENDPOINTS.orderdetails}/${id}`),

    //---confirm/{id} ---//
    confirmOrder: async (id: number): Promise<ApiResponse<any>> =>
        apiClient.patch(`${ENDPOINTS.statusconfirm}/${id}`),

    //---/ship/{id}---//
    shipOrder: async (id: number): Promise<ApiResponse<any>> =>
        apiClient.patch(`${ENDPOINTS.statusship}/${id}`),

    //---deliver/{id}---//
    deliverOrder: async (id: number): Promise<ApiResponse<any>> =>
        apiClient.patch(`${ENDPOINTS.statusdeliver}/${id}`),
    //---complete/{id}---//
    completeOrder: async (id: number): Promise<ApiResponse<any>> =>
        apiClient.patch(`${ENDPOINTS.statuscomplete}/${id}`),

    //---status-payment/{id}---//
    updatePayment: async (id: number, status: string): Promise<ApiResponse<any>> =>
        apiClient.put(`${ENDPOINTS.statuspayment}/${id}`, { status }),

    exportOrders: async (): Promise<ApiResponse<Blob>> =>
        apiClient.get(ENDPOINTS.ordersexport, {
            responseType: 'blob'
        }),

    fetchOrderPdf: async (): Promise<ApiResponse<Blob>> =>
        apiClient.get(ENDPOINTS.orderspdf, {
            responseType: 'blob'
        }),

    fetchInvoice: async (id: number): Promise<ApiResponse<Blob>> =>
        apiClient.get(`${ENDPOINTS.invoice}/${id}/invoice`, { responseType: 'blob' }),
};