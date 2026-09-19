import { apiClient } from "@/src/app/components/services/api/apiClient";
import { ApiResponse } from "@/src/app/components/services/utils/models";
import {ReviewListResponse} from "@/src/app/components/modules/product-reviews/core/models/productsReviewsModel";
import {ENDPOINTS} from "@/src/app/components/modules/product-reviews/core/api/endpoints";


export const productreviewsClient = {

    fetchProductsReview: async (signal?: AbortSignal): Promise<ApiResponse<ReviewListResponse>> =>
        apiClient.get(ENDPOINTS.reviewsreply, { signal }),

    fetchReviewById: async (id: string) =>
        apiClient.get(`${ENDPOINTS.reviewsreply}/${id}`),

    replyToReview: async (reviewId: number, comment: string) => {
        return apiClient.post(`${ENDPOINTS.reviewsreply}/${reviewId}`, { comment });
    },

    updateReply: async (replyId: number, comment: string) => {
        return apiClient.put(`${ENDPOINTS.reviewsreply}/${replyId}`, { comment });
    },

    deleteReply: async (replyId: number) => {
        return apiClient.delete(`${ENDPOINTS.reviewsreply}/${replyId}`);
    }

};