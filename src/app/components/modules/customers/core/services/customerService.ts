import { customersClient } from "@/src/app/components/modules/customers/core/api/customerClient";

export const customerService = {
    /**
     * Fetch standard registered customer profiles with support for signal cancellation.
     */
    getCustomers: async (signal?: AbortSignal) => {
        return await customersClient.fetchUsers(signal);
    },

    /**
     * Fetch an individual detailed customer profile by its unique identifier.
     * Expects: string
     */
    getCustomerById: async (id: string | number, signal?: AbortSignal) => {
        return await customersClient.fetchUserById(`${id}`, signal);
    },

    /**
     * Updates an individual customer demographic payload profile.
     * Expects: number
     */
    updateCustomer: async (id: string | number, data: FormData) => {
        const numericId = typeof id === 'number' ? id : Number(id);
        return await customersClient.updateUser(numericId, data as any);
    },

    /**
     * Updates authorization access control roles on a targeting profile.
     */
    updateCustomerRole: async (id: string | number, role: string) => {
        const numericId = typeof id === 'number' ? id : Number(id);
        return await customersClient.updateUserRole(numericId, role);
    },

    /**
     * Modifies the operational status of an individual customer.
     */
    updateStatus: async (id: string | number, status: string, context?: any) => {
        const numericId = typeof id === 'number' ? id : Number(id);
        return await customersClient.updateUserStatus(numericId, status, context);
    },

    /**
     * Purges a targeting client account profile record.
     */
    deleteCustomer: async (id: string | number) => {
        const numericId = typeof id === 'number' ? id : Number(id);
        return await customersClient.deleteUser(numericId);
    },

    /**
     * Requests an Excel data layout structure binary buffer.
     */
    exportToExcel: async () => {
        return await customersClient.exportCustomersExcel();
    },

    /**
     * Requests a PDF report data binary layout array format.
     */
    exportToPdf: async () => {
        return await customersClient.exportCustomersPdf();
    },

    /**
     * Dynamically triggers browser attachment downloads safely inside standard window environments.
     */
    triggerDownload: (blob: Blob, filename: string) => {
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