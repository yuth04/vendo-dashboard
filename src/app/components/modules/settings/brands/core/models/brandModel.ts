export interface Brand {
    id: number;
    name: string;
    slug: string;
    status: 'active' | 'inactive';
    image: string | null;
    description?: string | null;
    products?: any[];
}

export interface BrandListResponse {
    message: string;
    brands: Brand[];
}

export interface BrandDetailResponse {
    message: string;
    brands: Brand;
}

export const INITIAL_BRAND_DATA: BrandListResponse = {
    message: '',
    brands: []
};

export const INITIAL_BRAND_DETAIL: BrandDetailResponse = {
    message: '',
    brands: {
        id: 0,
        name: '',
        slug: '',
        status: 'active',
        image: null,
        description: null,
        products: []
    }
};