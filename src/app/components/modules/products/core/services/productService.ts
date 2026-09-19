'use client';

import { productClient } from "@/src/app/components/modules/products/core/api/productClient";
import { Product, ProductListResponse } from "@/src/app/components/modules/products/core/models/productModel";

export const productService = {

    getProducts: () =>
        productClient.fetchProducts(),

    getProductById: (id: number) =>
        productClient.fetchProductById(id),

    getCategories: () =>
        productClient.fetchCategories(),

    getBrands: () =>
        productClient.fetchBrands(),

    getVariants: (signal?: AbortSignal) =>
        productClient.fetchVariants(signal),

    getVariantById: (id: number, signal?: AbortSignal) =>
        productClient.fetchVariantById(id, signal),

    createProduct: (data: FormData) =>
        productClient.createProduct(data),

    createVariant: (data: FormData) =>
        productClient.createProductVariant(data),

    updateProduct: (id: number, data: FormData) =>
        productClient.updateProduct(id, data),

    updateVariant: (id: number, data: FormData) =>
        productClient.updateProductVariant(id, data),

    deleteProduct: (id: number) =>
        productClient.deleteProduct(id),

    deleteVariant: (id: number) =>
        productClient.deleteProductVariant(id),

    getTotalStock: (product: Product): number =>
        product.variants?.reduce((sum, v) => sum + (v.stock ?? 0), 0) ?? 0,

    extractCategories: (data: ProductListResponse | null | undefined) => {
        const products = data?.product ?? [];
        const unique = new Map<number, string>();
        products.forEach(p => {
            if (p.category?.id && p.category?.name) {
                unique.set(p.category.id, p.category.name);
            }
        });
        return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
    },

    filterProducts: (
        products: Product[],
        searchTerm: string,
        selectedCategory: string,
        selectedStatus: string
    ): Product[] =>
        products.filter(product => {
            const matchesSearch = (product.productName ?? '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory ? String(product.category?.id) === selectedCategory : true;
            const matchesStatus = selectedStatus ? (product.status ?? 'active').toLowerCase() === selectedStatus.toLowerCase() : true;
            return matchesSearch && matchesCategory && matchesStatus;
        }),

    getTotalPages: (totalItems: number, itemsPerPage: number): number =>
        Math.max(1, Math.ceil(totalItems / itemsPerPage)),

    paginate: <T>(items: T[], currentPage: number, itemsPerPage: number): T[] => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return items.slice(startIndex, startIndex + itemsPerPage);
    },

    exportProducts: async ({
                               type,
                               onSuccess,
                               onError,
                           }: {
        type: 'excel' | 'pdf';
        onSuccess: (msg: string) => void;
        onError: (msg: string) => void;
    }) => {
        try {
            const response = type === 'excel'
                ? await productClient.exportProducts()
                : await productClient.exportProductsPdf();

            if (response?.data) {
                const blob = new Blob([response.data as unknown as BlobPart], {
                    type: type === 'excel'
                        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        : 'application/pdf'
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `products_export_${new Date().toISOString().slice(0, 10)}.${type === 'excel' ? 'xlsx' : 'pdf'}`);
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
                window.URL.revokeObjectURL(url);
                onSuccess(`Products exported to ${type.toUpperCase()} successfully.`);
            } else {
                throw new Error("No data returned");
            }
        } catch {
            onError(`Failed to export products to ${type.toUpperCase()}.`);
        }
    },
};