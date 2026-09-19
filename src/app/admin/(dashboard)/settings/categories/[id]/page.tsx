'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import CategoryDetails from "@/src/app/components/modules/settings/categories/components/CategoryDetails";
import { useAlert } from "@/src/app/components/context/AlertContext";
import {categoriesClient} from "@/src/app/components/modules/settings/categories/core/api/categoriesClient";

const Page = () => {
    const router = useRouter();
    const params = useParams();
    const { showToast, showConfirm } = useAlert();

    const categoryId = Number(params?.id);

    // --- Delete Handler ---
    const handleDelete = async (id: number, name: string) => {
        const confirmed = await showConfirm({
            title: "Delete Category",
            message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            confirmLabel: "Delete",
            variant: "danger"
        });

        if (confirmed) {
            try {
                const response = await categoriesClient.deleteCategory(id);
                if (!response.error) {
                    showToast("Category deleted successfully", "success");
                    router.push('/admin/settings/categories');
                } else {
                    showToast(response.error.message || "Failed to delete", "error");
                }
            } catch (err) {
                showToast("An error occurred during deletion", "error");
            }
        }
    };

    if (!categoryId || isNaN(categoryId)) {
        return <div className="p-8 text-center font-bold text-gray-500">Invalid Category ID</div>;
    }

    return (
        <div>
            <CategoryDetails
                categoryId={categoryId}
                onBack={() => router.back()}
                onEdit={() =>
                    router.push(`/admin/settings/categories/${categoryId}/edit`)
                }
                onDelete={handleDelete}
            />
        </div>
    );
};

export default Page;