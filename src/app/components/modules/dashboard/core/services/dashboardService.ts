'use client';

import { dashboardClient } from "@/src/app/components/modules/dashboard/core/api/dashboardClient";
import { DashboardResponse } from "@/src/app/components/modules/dashboard/core/models/dashboardModel";
import { ApiResponse } from "@/src/app/components/services/utils/models";

export const dashboardService = {
    /**
     * Fetches dashboard statistics based on filter conditions or exact date boundaries.
     */
    fetchDashboardData: async (
        filter: string = 'month',
        signal?: AbortSignal,
        customStart?: Date,
        customEnd?: Date
    ): Promise<ApiResponse<DashboardResponse>> => {
        try {
            const result = await dashboardClient.fetchDashboard(filter, signal, customStart, customEnd);
            return {
                data: result.data,
                error: null
            };
        } catch (error: any) {
            return {
                data: null as any,
                error: {
                    message: error?.message || "Failed to load dashboard statistics",
                    code: "DASHBOARD_FETCH_ERROR"
                }
            };
        }
    }
};