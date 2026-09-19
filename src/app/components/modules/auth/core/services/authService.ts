'use client';

import { ApiResponse } from "@/src/app/components/services/utils/models";
import { authClient } from "@/src/app/components/modules/auth/core/api/authClient";

export const authService = {

    async login(credentials: any): Promise<ApiResponse<any>> {
        try {
            const response = await authClient.login(credentials);
            if (response) {
                return { data: response, error: null };
            }

            return {
                data: null,
                error: { message: "Invalid email or password. Please try again." }
            };
        } catch (error: any) {
            return {
                data: null,
                error: {
                    message: error?.response?.data?.message || error?.message || "Invalid email or password. Please try again."
                }
            };
        }
    }
};