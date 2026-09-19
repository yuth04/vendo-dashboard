import { apiClient } from "@/src/app/components/services/api/apiClient";
import {ApiResponse} from "@/src/app/components/services/utils/models";
import {ProductReportResponse} from "@/src/app/components/modules/product-reports/core/models/productReportModel";
import {ENDPOINTS} from "@/src/app/components/modules/product-reports/core/api/endpoints";





export const productrportClient = {
    fetchProductReport: async (
        dates?: { start_date: string; end_date: string },
        signal?: AbortSignal
    ): Promise<ApiResponse<ProductReportResponse>> => {
        let url = ENDPOINTS.productreports;

        if (dates?.start_date && dates?.end_date) {
            url += `?start_date=${dates.start_date}&end_date=${dates.end_date}`;
        }
        return apiClient.get(url, { signal });
    },

    exportProducts: async (): Promise<ApiResponse<Blob>> => {
        return await apiClient.get(ENDPOINTS. productsreportexcel, {
            responseType: 'blob'
        });
    },

    exportProductsPdf: async (): Promise<ApiResponse<Blob>> => {
        return await apiClient.get(ENDPOINTS.productsreportpdf, {
            responseType: 'blob'
        });
    },

};