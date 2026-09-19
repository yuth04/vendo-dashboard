export interface PromoProduct {
    id: number;
    productName: string;
    slug: string;
    description: string | null;
    price: string;
    category_id: number;
    brand_id: number;
    image_file_id: number | null;
    image: string;
    discount_price: string;
    status: string;
}

export interface Discount {
    id: number;
    name: string | null;
    description: string | null;
    amount: string;
    type: "percent" | "fixed";
    start_date: string | null;
    end_date: string | null;
    banner_image: string | null;
    is_active: boolean;
    slug: string | null;
    products: PromoProduct[];
    coupon: string | null;
}

export interface PromotionResponse {
    message: string;
    discount: Discount[];
}