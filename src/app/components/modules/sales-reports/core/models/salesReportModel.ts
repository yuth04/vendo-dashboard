export interface SalesReportStats {
    total_orders: number;
    total_earnings: string;
    total_discounts: string;
    shipping_charges: string;
}

export interface SalesReportOrder {
    order_id: string;
    date: string;
    total: string;
    discount: number | string;
    shipping: string;
    payment: {
        method: string;
        status: string;
    };
    status: string;
}

export interface SalesReportResponse {
    filter: {
        start_date: string;
        end_date: string;
    };
    stats: SalesReportStats;
    orders: SalesReportOrder[];
}