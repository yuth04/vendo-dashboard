import React, { Suspense } from 'react';
import Brands from "@/src/app/components/modules/settings/brands/components/Brands";
import { Loader2 } from "lucide-react";

const Page = () => {
    return (
        <Suspense fallback={
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="animate-spin text-cyan-500" size={32} />
            </div>
        }>
            <Brands />
        </Suspense>
    );
};

export default Page;