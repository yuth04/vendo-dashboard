export interface ParentCategory{
    id: number;
    name: string;
    status: boolean;
    parent_category_id?: number | null;
    slug?: string;
    image?: string | null;
}


export interface ParentCategoryResponse {
    message?: string;
    data: ParentCategory[];
}

export const INITIAL_CATEGORY_DATA: ParentCategoryResponse = {
    data: []
};