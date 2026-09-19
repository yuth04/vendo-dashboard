import { apiClient } from "@/src/app/components/services/api/apiClient";
import {ApiResponse} from "@/src/app/components/services/utils/models";
import {SalesReportResponse} from "@/src/app/components/modules/sales-reports/core/models/salesReportModel";
import {ENDPOINTS} from "@/src/app/components/modules/sales-reports/core/api/endpoints";




export const salerportClient = {

    fetchSaleReport: async (
        dates?: { start_date: string; end_date: string },
        signal?: AbortSignal
    ): Promise<ApiResponse<SalesReportResponse>> => {
        let url = ENDPOINTS.salereports;
        if (dates?.start_date && dates?.end_date) {
            url += `?start_date=${dates.start_date}&end_date=${dates.end_date}`;
        }

        return apiClient.get(url, { signal });
    },

    exportSalesReportExcel: async (): Promise<ApiResponse<Blob>> => {
        return await apiClient.get(ENDPOINTS.salesreportexcel, {
            responseType: 'blob'
        });
    },

    exportSalesReportPdf: async (): Promise<ApiResponse<Blob>> => {
        return await apiClient.get(ENDPOINTS.salesreportpdf, {
            responseType: 'blob'
        });
    },
};