export interface ProductReportStats {
    total_product: number;
    total_quantity_sold: number;
    total_categories: number;
    total_revenue: string;
}

export interface ProductReportItem {
    variant_id: number;
    product_name: string;
    variant: {
        size: string;
        color: string;
    };
    category: string;
    image: string;
    total_quantity: number;
}

export interface ProductReportResponse {
    filter: {
        start_date: string;
        end_date: string;
    };
    stats: ProductReportStats;
    products: ProductReportItem[];
}