'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import BrandDetails from "@/src/app/components/modules/settings/brands/components/BrandDetails";

const Page = () => {
    const router = useRouter();
    const params = useParams();

    const brandId = Number(params?.id);

    return (
        <div>
            <BrandDetails
                brandId={brandId}
                onBack={() => router.back()}
                onEdit={(id: number) => router.push(`/admin/settings/brands/${id}/edit`)}
            />
        </div>
    );
};

export default Page;