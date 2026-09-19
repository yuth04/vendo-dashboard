export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    image: string;
    role: string;
    created_at?: string;
    created_at_human?: string;
}

export interface Review {
    id: number;
    user_id: number;
    product_id: number;
    rating: number;
    comment: string;
    is_approved: boolean;
    user: User;
    replies: Review[];
    created_at?: string;
    created_at_human?: string;
}

export interface ReviewListResponse {
    message: string;
    data: Review[];
}