import { apiClient } from "@/src/app/components/services/api/apiClient";
import {CouponDetailResponse, CouponListResponse} from "@/src/app/components/modules/coupons/core/models/couponModel";
import {ENDPOINTS} from "@/src/app/components/modules/coupons/core/api/endpoints";


export const couponClient = {

    fetchCoupons: async (signal?: AbortSignal): Promise<CouponListResponse> => {
        const response = await apiClient.get<CouponListResponse>(ENDPOINTS.coupons, { signal });
        return response.data!;
    },

    fetchCouponById: async (id: string | number): Promise<CouponDetailResponse> => {
        const response = await apiClient.get<CouponDetailResponse>(`${ENDPOINTS.coupons}/${id}`);
        return response.data!;
    },

    createCoupon: async (data: any): Promise<any> => {
        return await apiClient.post(ENDPOINTS.coupons, data);
    },

    updateCoupon: async (id: string | number, data: any): Promise<any> => {
        return await apiClient.post(`${ENDPOINTS.coupons}/${id}`, data);
    },

    deleteCoupon: async (id: string | number): Promise<any> => {
        return await apiClient.delete(`${ENDPOINTS.coupons}/${id}`);
    },
};