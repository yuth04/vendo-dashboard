export interface Brand {
    id: number;
    name: string;
    slug: string;
    status?: string;
    image_file_id?: string | null;
    image: string | null;
}

export interface Category {
    id: number;
    parent_category_id: number | null;
    name: string;
    slug: string;
    image: string | null;
    is_active: boolean;
    image_file_id: string | null;
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
    status?: string;
    product?: {
        id: number;
        productName: string;
        category_name?: string;
        image: string | null;
        price: string;
    };
    images?: ProductVariantImage[];
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
    image_file_id: string | null;
    image: string | null;
    discount_price: number | string | null;
    status?: string;
    created_by?: string | null;
    updated_by?: string | null;
    category: Category;
    brand: Brand;
    variants: ProductVariant[];
}


export interface ProductListResponse {
    message: string;
    product: Product[];
}

export interface CategoryListResponse {
    message: string;
    category: Category[];
}