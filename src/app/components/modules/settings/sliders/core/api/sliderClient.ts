import { apiClient } from "@/src/app/components/services/api/apiClient";
import {ApiResponse} from "@/src/app/components/services/utils/models";
import {CarouselListResponse} from "@/src/app/components/modules/settings/sliders/core/models/sliderModel";
import {ENDPOINTS} from "@/src/app/components/modules/settings/sliders/core/api/endpoints";






export const slidersClient = {

    fetchSliders: async (signal?: AbortSignal): Promise<ApiResponse<CarouselListResponse>> =>
        apiClient.get(ENDPOINTS.carousels, { signal }),

    //--- Create New Slider ---//
    createSlider: async (data: any): Promise<ApiResponse<any>> =>
        apiClient.post(ENDPOINTS.admincarousels, data),

    //--- Update Slider ---//
    updateSlider: async (id: number, data: any): Promise<ApiResponse<any>> =>
        apiClient.post(`${ENDPOINTS.admincarousels}/${id}`, data),

    //--- Delete Slider ---//
    deleteSlider: async (id: number): Promise<ApiResponse<any>> =>
        apiClient.delete(`${ENDPOINTS.admincarousels}/${id}`),
};