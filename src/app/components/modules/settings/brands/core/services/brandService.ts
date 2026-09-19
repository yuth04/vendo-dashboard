import { Brand } from "@/src/app/components/modules/settings/brands/core/models/brandModel";
import { brandClient } from "@/src/app/components/modules/settings/brands/core/api/branhClient";

//--heroSection-brand--//
/**
 * Toggles the brand status between 'active' and 'inactive'
 */
export const toggleBrandStatusLogic = async (brand: Brand) => {
    const newStatus = brand.status?.toLowerCase() === 'active' ? 'inactive' : 'active';
    const formData = new FormData();

    Object.keys(brand).forEach((key) => {
        if (key === 'image' || key === 'products') return;
        const val = (brand as any)[key];
        if (val !== null && val !== undefined && typeof val !== 'object') {
            formData.append(key, val);
        }
    });

    formData.set('status', newStatus);
    const response = await brandClient.updateBrand(brand.id, formData);

    return { response, newStatus };
};

/**
 * Handles the logic for filtering brands based on search and status
 */
export const filterBrandsList = (brands: Brand[], query: string, status: string) => {
    return brands.filter((brand) => {
        const matchesSearch = brand.name.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = status === 'all' || brand.status?.toLowerCase() === status.toLowerCase();
        return matchesSearch && matchesStatus;
    });
};

/**
 * Formats the image URL for Brand List and Details
 */
export const getFormattedImageUrl = (path: string | null | undefined, baseUrl: string) => {
    if (!path) return null;
    const cleanPath = path.trim();
    if (cleanPath.startsWith('http')) return cleanPath;
    return `${baseUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
};

//--heroSection-brand-end--//


//--Add-brand--//

/**
 * Logic for creating a brand
 */
export const createBrandLogic = async (data: {
    name: string;
    slug: string;
    status: string;
    imageFile: File | null;
}) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('slug', data.slug);
    formData.append('status', data.status);

    if (data.imageFile) {
        formData.append('image', data.imageFile);
    }

    const response = await brandClient.createBrand(formData);
    return response;
};

//--Add-brand-end--//

//--edit--brand--//
/**
 * Logic for updating an existing brand with full data object
 */
export const updateBrandLogic = async (
    brandId: number,
    data: {
        name: string;
        slug: string;
        status: string;
        imageFile: File | null;
    }
) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('slug', data.slug);
    formData.append('status', data.status);

    if (data.imageFile) {
        formData.append('image', data.imageFile);
    }

    const response = await brandClient.updateBrand(brandId, formData);
    return response;
};

/**
 * Generates a URL-friendly slug from a string
 */
export const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

//--edit--brand-end--//