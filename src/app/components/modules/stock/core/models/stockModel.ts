export interface Brand {
    id: number;
    name: string;
    slug: string;
    " image": string | null;
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

export interface ProductVariantImage {
    id: number;
    variant_id: number;
    image: string;
    is_primary: boolean;
    position: number;
}

export interface ProductVariant {
    id: number;
    product_id: number;
    size: string;
    color: string;
    stock: number;
    product: {
        id: number;
        productName: string;
        category_name?: string;
        image: string | null;
        price: string;
    };
    images: ProductVariantImage[];
}

export interface VariantListResponse {
    message: string;
    product_variant: ProductVariant[];
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
    status?: string;
    category: Category;
    brand: Brand;
    variants: ProductVariant[];
}


export interface CategoryListResponse {
    message: string;
    categories: Category[];
}

export const INITIAL_VARIANT_DATA: VariantListResponse = { message: '', product_variant: [] };
export const INITIAL_CATEGORY_DATA: CategoryListResponse = { message: '', categories: [] };