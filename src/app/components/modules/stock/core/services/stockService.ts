'use client';

import { stockClient } from "@/src/app/components/modules/stock/core/api/stockClient";
import { ProductVariant, VariantListResponse } from "@/src/app/components/modules/stock/core/models/stockModel";

export type StockStatus = 'all' | 'low' | 'out';

export interface GroupedProduct {
    product: any;
    variants: ProductVariant[];
    totalStock: number;
}

export interface ExportParams {
    type: 'excel' | 'pdf';
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

export interface DeleteVariantParams {
    variantId: number;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

export interface SaveStockParams {
    variantId: number;
    newStock: number;
    setIsUpdating: (val: boolean) => void;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
    onClose: () => void;
    refetchData: () => void;
}

export const stockService = {

    groupAndFilterVariants(
        data: VariantListResponse | null,
        searchQuery: string,
        selectedCategoryId: string,
        selectedStockStatus: StockStatus
    ): GroupedProduct[] {
        const variants = data?.product_variant || [];
        const groups: Record<number, GroupedProduct> = {};

        variants.forEach(variant => {
            const pid = variant.product_id;
            if (!groups[pid]) {
                groups[pid] = {
                    product: variant.product,
                    variants: [],
                    totalStock: 0,
                };
            }
            groups[pid].variants.push(variant);
            groups[pid].totalStock += variant.stock;
        });

        return Object.values(groups).filter(group => {
            const matchesSearch = group.product.productName
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            const productCatId = group.product.category_id || group.product.category?.id;
            const matchesCategory =
                selectedCategoryId === 'all' ||
                productCatId?.toString() === selectedCategoryId;

            let matchesStatus = true;
            if (selectedStockStatus === 'low') {
                matchesStatus = group.totalStock > 0 && group.totalStock <= 5;
            } else if (selectedStockStatus === 'out') {
                matchesStatus = group.totalStock <= 0;
            }

            return matchesSearch && matchesCategory && matchesStatus;
        });
    },

    buildCategoryMap(categoryOptions: any[]): Record<string, string> {
        const map: Record<string, string> = {};
        categoryOptions.forEach((cat: any) => {
            map[cat.id.toString()] = cat.name;
        });
        return map;
    },

    paginate<T>(items: T[], currentPage: number, itemsPerPage: number): T[] {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return items.slice(startIndex, startIndex + itemsPerPage);
    },

    getTotalPages(totalItems: number, itemsPerPage: number): number {
        return Math.ceil(totalItems / itemsPerPage);
    },

    getStockStatusLabel(stock: number): string {
        if (stock <= 0) return 'OUT OF STOCK';
        if (stock <= 5) return 'LOW STOCK';
        return 'IN STOCK';
    },

    async saveStock({
                        variantId,
                        newStock,
                        setIsUpdating,
                        onSuccess,
                        onError,
                        onClose,
                        refetchData,
                    }: SaveStockParams): Promise<void> {
        setIsUpdating(true);
        try {
            const response = await stockClient.updateVariant(variantId, newStock);
            if (response) {
                onSuccess('Stock updated successfully');
                onClose();
                refetchData();
            }
        } catch (error: any) {
            onError(error?.response?.data?.message || 'An error occurred.');
        } finally {
            setIsUpdating(false);
        }
    },

    async deleteVariant({
                            variantId,
                            onSuccess,
                            onError,
                        }: DeleteVariantParams): Promise<void> {
        try {
            await stockClient.deleteProductVariant(variantId);
            onSuccess('Variant deleted successfully');
        } catch (error: any) {
            onError(error?.response?.data?.message || 'Failed to delete variant');
        }
    },

    async exportStock({
                          type,
                          onSuccess,
                          onError,
                      }: ExportParams): Promise<void> {
        try {
            const response =
                type === 'excel'
                    ? await stockClient.exportStocksExcel()
                    : await stockClient.exportStocksPdf();

            if (response?.data) {
                const blob = new Blob([response.data as any], {
                    type:
                        type === 'excel'
                            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            : 'application/pdf',
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute(
                    'download',
                    `stock_report_${new Date().getTime()}.${type === 'excel' ? 'xlsx' : 'pdf'}`
                );
                document.body.appendChild(link);
                link.click();
                link.remove();
                onSuccess(`Stocks exported to ${type.toUpperCase()} successfully`);
            }
        } catch (error) {
            console.error('Export error:', error);
            onError('Failed to export file');
        }
    },

    validateStockInput(value: number | string): number | null {
        const numeric = Number(value);
        if (isNaN(numeric)) return null;
        return numeric;
    },
};