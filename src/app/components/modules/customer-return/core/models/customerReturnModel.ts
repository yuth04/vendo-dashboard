export interface ReturnDetailItem {
    id: number;
    order_number: string;
    date: string;
    reason: string;
    note: string;
    status: string;
    payment_status: string;
    payment_method: string;
    shipping_fee: string;
    total_price: string;
    customer: {
        first_name: string;
        last_name: string;
        email: string;
        avatar: string | null;
    };
    shipping_address: {
        id: number;
        user_id: number;
        first_name: string;
        last_name: string;
        address_line: string;
        city: string;
        province: string;
        phone: string;
        postal_code: string;
        is_default: boolean;
    };
    items: {
        id: number;
        product_name: string;
        price: string;
        quantity: number;
        subtotal: number;
        size: string;
        color: string;
        product_image: string | null;
    }[];
}

export interface ReturnDetailResponse {
    message: string;
    data: ReturnDetailItem;
}


export interface ReturnItem {
    id: number;
    order_number: string;
    date: string;
    time: string;
    reason: string;
    note: string;
    status: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string | null;
}

export interface ReturnHistoryResponse {
    message: string;
    data: ReturnItem[];
}