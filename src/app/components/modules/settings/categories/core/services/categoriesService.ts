import { Category } from "@/src/app/components/modules/settings/categories/core/models/categoriesModel";
import { categoriesClient } from "@/src/app/components/modules/settings/categories/core/api/categoriesClient";

export const CategoryService = {
    /**
     * Filters the category list based on name and status
     */
    filterCategoriesList: (
        list: Category[],
        searchQuery: string,
        statusFilter: string
    ): Category[] => {
        return list.filter((cat) => {
            const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus =
                statusFilter === 'All Statuses' ||
                (statusFilter === 'Active' && cat.is_active) ||
                (statusFilter === 'Inactive' && !cat.is_active);
            return matchesSearch && matchesStatus;
        });
    },

    /**
     * Handles the status toggle logic for a category
     */
    toggleCategoryStatusLogic: async (category: Category) => {
        const newStatus = !category.is_active;
        const formData = new FormData();

        formData.append("name", category.name);
        formData.append("slug", category.slug);
        formData.append("is_active", newStatus ? "1" : "0");

        if (category.parent_category_id) {
            formData.append("parent_category_id", String(category.parent_category_id));
        }

        const response = await categoriesClient.updateCategory(formData, category.id);
        return { response, newStatus };
    },

    /**
     * Handles Category Creation logic
     */
    createCategoryLogic: async (data: {
        name: string;
        slug: string;
        status: 'ACTIVE' | 'INACTIVE';
        parentId?: string | number | null;
        imageFile?: File | null;
    }) => {
        const formData = new FormData();
        formData.append("name", data.name.trim());
        formData.append("slug", data.slug);
        formData.append("is_active", data.status === 'ACTIVE' ? "1" : "0");

        if (data.parentId !== undefined && data.parentId !== null && data.parentId !== "") {
            formData.append("parent_category_id", String(data.parentId));
        }

        if (data.imageFile) {
            formData.append("image", data.imageFile);
        }

        return await categoriesClient.createCategory(formData);
    },

    /**
     * Handles Category Update logic
     * COMBINED FIX: Matches every single potential expected data format to pass validation hooks.
     */
    updateCategoryLogic: async (id: number, data: {
        name: string;
        slug: string;
        status: 'ACTIVE' | 'INACTIVE';
        parentId?: string | number | null;
        imageFile?: File | null;
    }) => {
        const hasNewImage = data.imageFile && data.imageFile instanceof File;

        // 1. JSON PAYLOAD FALLBACK HANDLING
        if (!hasNewImage) {
            let parsedParent: number | null = null;
            if (data.parentId !== undefined && data.parentId !== null && data.parentId !== "") {
                const num = Number(data.parentId);
                if (!isNaN(num) && num !== Number(id)) {
                    parsedParent = num;
                }
            }

            // We supply all common name patterns (parent_id, parent_category_id)
            // across alternative data types (Integer vs String) to ensure a match.
            const jsonPayload: Record<string, any> = {
                name: data.name.trim(),
                slug: data.slug,
                // Pass status flags in both string format and integer options
                is_active: data.status === 'ACTIVE' ? 1 : 0,
                status: data.status === 'ACTIVE' ? "1" : "0",
            };

            if (parsedParent !== null) {
                // Supply the selected ID as both a raw number and a string representation
                jsonPayload["parent_id"] = parsedParent;
                jsonPayload["parent_category_id"] = parsedParent;
                jsonPayload["parent_id_string"] = String(parsedParent);
            } else {
                // If clearing out the relation, assign standard structural blanks
                jsonPayload["parent_id"] = null;
                jsonPayload["parent_category_id"] = null;
            }

            return await categoriesClient.updateCategory(jsonPayload as any, id);
        }

        // 2. MULTIPART FORM DATA FALLBACK HANDLING
        else {
            const formData = new FormData();
            formData.append("name", data.name.trim());
            formData.append("slug", data.slug);
            formData.append("is_active", data.status === 'ACTIVE' ? "1" : "0");

            if (data.parentId !== undefined && data.parentId !== null && data.parentId !== "") {
                const parsedParent = Number(data.parentId);
                if (!isNaN(parsedParent) && parsedParent !== Number(id)) {
                    formData.append("parent_category_id", String(parsedParent));
                    formData.append("parent_id", String(parsedParent));
                }
            } else {
                // Clear state matching empty form parameters
                formData.append("parent_category_id", "");
                formData.append("parent_id", "");
            }

            if (data.imageFile) {
                formData.append("image", data.imageFile);
            }

            return await categoriesClient.updateCategory(formData, id);
        }
    },

    /**
     * Handles Category Deletion logic
     */
    deleteCategoryLogic: async (id: number) => {
        return await categoriesClient.deleteCategory(id);
    },

    /**
     * Calculates pagination slice
     */
    getPaginatedItems: <T>(items: T[], page: number, itemsPerPage: number): T[] => {
        const startIndex = (page - 1) * itemsPerPage;
        return items.slice(startIndex, startIndex + itemsPerPage);
    }
};