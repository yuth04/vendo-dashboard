import { ApiResponse } from "@/src/app/components/services/utils/models";
import {StaffClient} from "@/src/app/components/modules/staff/core/api/StaffClient";
import {Staff, StaffListResponse} from "@/src/app/components/modules/staff/core/models/StaffModel";


export const StaffService = {
    async getStaffs(signal?: AbortSignal): Promise<ApiResponse<StaffListResponse>> {
        try {
            const response = await StaffClient.fetchStaffs(signal);
            if (response && response.data) {
                return { data: response.data, error: null };
            }
            return { data: null, error: { message: "Data payload layout unavailable or broken." } };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error?.message || "An error occurred while fetching admin data." }
            };
        }
    },

    async fetchAdminById(id: string | number, signal?: AbortSignal): Promise<any> {
        return StaffClient.fetchStaffById(`${id}`, signal);
    },

    async updateAdmin(id: string | number, data: FormData): Promise<ApiResponse<any>> {
        const numericId = typeof id === 'number' ? id : Number(id);
        return StaffClient.updateStaff(numericId, data as any);
    },

    async updateAdminRole(id: string | number, role: string): Promise<ApiResponse<any>> {
        const numericId = typeof id === 'number' ? id : Number(id);
        return StaffClient.updateStaffRole(numericId, role);
    },

    hasRoleUpdateMethod(): boolean {
        return typeof StaffClient.updateStaffRole === 'function';
    },

    async updateStatus(id: number, status: string, user: Staff): Promise<ApiResponse<any>> {
        return StaffClient.updateStaffStatus(id, status, user);
    },

    async deleteAdmin(id: string | number): Promise<ApiResponse<any>> {
        const numericId = typeof id === 'number' ? id : Number(id);
        return StaffClient.deleteStaff(numericId);
    },

    async exportToExcel(): Promise<any | null> {
        try {
            const result = await StaffClient.exportStaffsExcel();
            return result?.data || null;
        } catch (error) {
            console.error("Excel processing failure context:", error);
            return null;
        }
    },

    async exportToPdf(): Promise<any | null> {
        try {
            const result = await StaffClient.exportStaffsPdf();
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