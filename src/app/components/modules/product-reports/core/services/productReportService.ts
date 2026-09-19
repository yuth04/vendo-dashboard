import { productrportClient } from "@/src/app/components/modules/product-reports/core/api/productReportClient";
import { ProductReportResponse } from "@/src/app/components/modules/product-reports/core/models/productReportModel";
import { ApiResponse } from "@/src/app/components/services/utils/models";

export const productReportService = {
    formatToApiDate(dateStr: string): string {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}-${month}-${year}`;
    },

    async getProductReport(startDate: string, endDate: string, signal?: AbortSignal): Promise<ApiResponse<ProductReportResponse>> {
        try {
            const dates = {
                start_date: this.formatToApiDate(startDate),
                end_date: this.formatToApiDate(endDate)
            };

            const response = await productrportClient.fetchProductReport(dates);

            if (response && response.data) {
                return { data: response.data, error: null };
            }
            return { data: null, error: { message: "Failed to extract product performance metrics context." } };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "An error occurred while fetching the product report." }
            };
        }
    },

    async exportToExcel(): Promise<any | null> {
        try {
            const response = await productrportClient.exportProducts();
            return response?.data || null;
        } catch (error) {
            console.error("Excel data generation failure sequence context:", error);
            return null;
        }
    },

    async exportToPdf(): Promise<any | null> {
        try {
            const response = await productrportClient.exportProductsPdf();
            return response?.data || null;
        } catch (error) {
            console.error("PDF data layout generation error context:", error);
            return null;
        }
    },

    downloadFile(blob: Blob, fileName: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};