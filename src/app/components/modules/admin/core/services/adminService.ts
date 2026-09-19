import { ApiResponse } from "@/src/app/components/services/utils/models";
import {Admin, AdminListResponse} from "@/src/app/components/modules/admin/core/models/adminModel";
import { adminClient } from "@/src/app/components/modules/admin/core/api/adminClient";

export const adminService = {
    async getAdmins(signal?: AbortSignal): Promise<ApiResponse<AdminListResponse>> {
        try {
            const response = await adminClient.fetchAdmins(signal);
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
        return adminClient.fetchAdminById(`${id}`, signal);
    },

    async updateAdmin(id: string | number, data: FormData): Promise<ApiResponse<any>> {
        const numericId = typeof id === 'number' ? id : Number(id);
        return adminClient.updateAdmin(numericId, data as any);
    },

    async updateAdminRole(id: string | number, role: string): Promise<ApiResponse<any>> {
        const numericId = typeof id === 'number' ? id : Number(id);
        return adminClient.updateAdminRole(numericId, role);
    },

    hasRoleUpdateMethod(): boolean {
        return typeof adminClient.updateAdminRole === 'function';
    },

    async updateStatus(id: number, status: string, user: Admin): Promise<ApiResponse<any>> {
        return adminClient.updateAdminStatus(id, status, user);
    },

    async deleteAdmin(id: string | number): Promise<ApiResponse<any>> {
        const numericId = typeof id === 'number' ? id : Number(id);
        return adminClient.deleteAdmin(numericId);
    },

    async exportToExcel(): Promise<any | null> {
        try {
            const result = await adminClient.exportAdminsExcel();
            return result?.data || null;
        } catch (error) {
            console.error("Excel processing failure context:", error);
            return null;
        }
    },

    async exportToPdf(): Promise<any | null> {
        try {
            const result = await adminClient.exportAdminsPdf();
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