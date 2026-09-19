import { apiClient } from "@/src/app/components/services/api/apiClient";
import {DashboardResponse} from "@/src/app/components/modules/dashboard/core/models/dashboardModel";
import {ENDPOINTS} from "@/src/app/components/modules/dashboard/core/api/endpoints";


const fmt = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const dashboardClient = {
    fetchDashboard: async (
        filter: string = 'month',
        signal?: AbortSignal,
        customStart?: Date,
        customEnd?: Date,
    ): Promise<{ data: DashboardResponse }> => {
        const isCustom = !!(customStart && customEnd);
        const activeFilter = isCustom ? 'custom' : filter;

        let url = `${ENDPOINTS.admindashboard}?filter=${activeFilter}`;

        if (isCustom && customStart && customEnd) {
            url += `&start_date=${fmt(customStart)}&end_date=${fmt(customEnd)}`;
        }
        const response: any = await apiClient.get(url, { signal });

        return {
            data: response.data as DashboardResponse
        };
    },
};