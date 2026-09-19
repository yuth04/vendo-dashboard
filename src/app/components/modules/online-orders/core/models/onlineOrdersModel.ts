export interface OrderHistoryItem {
    id: number;
    order_number: string;
    date: string;
    time: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string | null;
    total_price: string;
    payment_method:string;
    items_count: number;
    status: string;
    payment: string;
}

export interface OrderHistoryResponse {
    message: string;
    data: OrderHistoryItem[];
}


export interface OrderDetailsData {
    id: number;
    order_number: string;
    date: string;
    time: string;
    status: string;
    payment_status: string;
    payment_method: string;
    shipping_fee: string;
    customer: {
        first_name: string;
        last_name: string;
        email: string;
        avatar: string | null;
    };
    shipping_address: {
        id: number;
        user_id?: number;
        first_name: string;
        last_name: string;
        address_line: string;
        city: string;
        province: string;
        phone: string;
        postal_code: string;
        is_default?: boolean;
    };
    items: {
        id: number;
        product_name: string | null;
        price: string;
        quantity: number;
        subtotal: number;
        size: string;
        color: string;
        product_image: string | null;
    }[];
}

export const INITIAL_ORDER_HISTORY: OrderHistoryResponse = {
    message: '',
    data: []
};