import { salerportClient } from "@/src/app/components/modules/sales-reports/core/api/salesReportClient";
import { SalesReportResponse } from "@/src/app/components/modules/sales-reports/core/models/salesReportModel";
import { ApiResponse } from "@/src/app/components/services/utils/models";

export const salesReportService = {
    formatToApiDate(dateStr: string): string {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}-${month}-${year}`;
    },

    async getSalesReport(startDate: string, endDate: string, signal?: AbortSignal): Promise<ApiResponse<SalesReportResponse>> {
        try {
            const dates = {
                start_date: this.formatToApiDate(startDate),
                end_date: this.formatToApiDate(endDate)
            };

            const response = await salerportClient.fetchSaleReport(dates);

            if (response && response.data) {
                return { data: response.data, error: null };
            }
            return { data: null, error: { message: "Data payload layout unavailable or broken." } };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "An error occurred while fetching report data layers." }
            };
        }
    },

    async exportToExcel(): Promise<any | null> {
        try {
            const result = await salerportClient.exportSalesReportExcel();
            return result?.data || null;
        } catch (error) {
            console.error("Excel processing failure context:", error);
            return null;
        }
    },

    async exportToPdf(): Promise<any | null> {
        try {
            const result = await salerportClient.exportSalesReportPdf();
            return result?.data || null;
        } catch (error) {
            console.error("PDF processing failure context:", error);
            return null;
        }
    },

    triggerDownload(data: any, filename: string): void {
        const blob = data as unknown as Blob;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};