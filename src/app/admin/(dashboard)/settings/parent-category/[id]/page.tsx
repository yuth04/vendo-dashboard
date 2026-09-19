'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import ViewParentCategoryModal from "@/src/app/components/modules/settings/parentcategory/components/ParentCategoryDetail";

const Page = () => {
    const router = useRouter();
    const params = useParams();

    const categoryId = Number(params?.id);


    if (!categoryId || isNaN(categoryId)) {
        return <div>Invalid Parent Category ID</div>;
    }

    return (
        <div>
            <ViewParentCategoryModal
                categoryId={categoryId}
                onBack={() => router.back()}
                onEdit={(id: number) =>
                    router.push(`/admin/settings/parent-category/${id}/edit`)
                }
            />
        </div>
    );
};

export default Page;