export interface Brand {
    id: number;
    name: string;
    slug: string;
    " image": string | null;
}

export interface Brand {
    id: number;
    name: string;
    slug: string;
    " image": string | null;
    products?: any[];
}

export interface ParentCategory{
    id: number;
    name: string;
    status: boolean;
    parent_category_id?: number | null;
    slug?: string;
    image?: string | null;
}


export interface Category {
    id: number;
    parent_category_id: number | null;
    name: string;
    slug: string;
    image: string | null;
    is_active: boolean;
    image_file_id: number | null;
}

export interface Product {
    id: number;
    productName: string;
    slug: string;
    description: string;
    price: string;
    category_id: number;
    brand_id: number;
    image_file_id: number | null;
    image: string | null;
    discount_price: number | string | null;
    category: Category;
    brand: Brand;
}

export interface CategoryListResponse {
    message: string;
    category: Category[];
}

export const INITIAL_CATEGORY_DATA: CategoryListResponse = {
    message: '',
    category: []
};