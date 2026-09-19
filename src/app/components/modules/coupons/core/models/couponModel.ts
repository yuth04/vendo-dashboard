export interface Coupon {
    id: number;
    name: string;
    code: string;
    type: 'percent' | 'fixed';
    value: string;
    start_date: string;
    end_date: string;
    min_amount: string;
    max_discount: string;
    usage_limit: number;
    used: number;
    status: string;
    description?: string;
    image?: string | null;
    image_file_id?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface CouponListResponse {
    message: string;
    date: Coupon[];
}


export interface CouponDetailResponse {
    error: null;
    message: string;
    date: Coupon;
}