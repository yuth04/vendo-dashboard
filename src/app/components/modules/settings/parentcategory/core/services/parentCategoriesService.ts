import {
    parentcategoriesClient
} from "@/src/app/components/modules/settings/parentcategory/core/api/parentCategoriesClient";

/**
 * Logic to filter the parent categories list based on search query and status option
 */
export const filterParentCategories = (list: any[], searchQuery: string, statusFilter: string) => {
    return list.filter((cat: any) => {
        const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All Statuses"
            ? true
            : statusFilter === "Active"
                ? cat.status === true
                : cat.status === false;
        return matchesSearch && matchesStatus;
    });
};

/**
 * Logic to fetch a single parent category profile entry by its internal ID
 */
export const fetchParentCategoryByIdLogic = async (id: number) => {
    if (!id) return Promise.reject(new Error("Invalid Category ID"));
    return await parentcategoriesClient.fetchParentcategoryById(id);
};

/**
 * Logic to create a new parent category entry
 */
export const createParentCategoryLogic = async (name: string, status: boolean) => {
    return await parentcategoriesClient.createParentcategory({
        name: name.trim(),
        status: status
    });
};

/**
 * Logic to complete comprehensive updates on category properties
 */
export const updateParentCategoryLogic = async (id: number, name: string, status: boolean) => {
    const payload = {
        name: name.trim(),
        status: status ? 1 : 0,
        _method: 'PUT'
    };
    return await parentcategoriesClient.updateParentcategory(id, payload);
};

/**
 * Logic to handle changing/toggling the active visibility status of a category
 */
export const toggleParentCategoryStatusLogic = async (cat: any, newStatus: boolean) => {
    const payload = {
        name: cat.name,
        status: newStatus ? 1 : 0
    };

    return await parentcategoriesClient.updateParentcategory(cat.id, payload);
};

/**
 * Logic to delete an entry from the database matching its internal ID
 */
export const deleteParentCategoryLogic = async (id: number) => {
    return await parentcategoriesClient.deleteParentcategory(id);
};