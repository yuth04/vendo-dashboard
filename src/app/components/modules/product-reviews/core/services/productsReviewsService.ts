'use client';

import { productreviewsClient } from "@/src/app/components/modules/product-reviews/core/api/ProductsReviewsClient";

export const productsReviewsService = {
    // Fetches all product reviews
    fetchReviews: async (signal?: AbortSignal) => {
        return await productreviewsClient.fetchProductsReview();
    },

    // FIXED: Added missing abstract handler method targeting individual dynamic id searches
    fetchReviewById: async (id: string) => {
        return await productreviewsClient.fetchReviewById(id);
    },

    // Submits a reply to a review
    replyToReview: async (reviewId: number, comment: string) => {
        return await productreviewsClient.replyToReview(reviewId, comment);
    },

    // Updates an existing reply
    updateReply: async (replyId: number, comment: string) => {
        return await productreviewsClient.updateReply(replyId, comment);
    },

    // Deletes an admin reply
    deleteReply: async (replyId: number) => {
        return await productreviewsClient.deleteReply(replyId);
    }
};