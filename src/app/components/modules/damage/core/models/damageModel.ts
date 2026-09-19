export interface DamageItem {
    id: number;
    product_id: number | string;
    product: {
        id: number;
        name: string;
        slug: string;
        image: string;
    };
    reason: string;
    quantity: number;
    current_stock: number;
    status: string;
    image_proof: string | null;
    reported_by: {
        first_name: string;
        last_name: string;
        date: string;
        time: string;
    };
}

export interface DamageResponse {
    message: string;
    data: DamageItem[];
}