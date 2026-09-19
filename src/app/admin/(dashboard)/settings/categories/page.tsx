import React, { Suspense } from 'react';
import Categories from "@/src/app/components/modules/settings/categories/components/Categories";
import { Loader2 } from "lucide-react";

const Page = () => {
    return (
        <div className="min-h-screen">
            <Suspense fallback={
                <div className="flex h-64 w-full items-center justify-center">
                    <Loader2 className="animate-spin text-cyan-500" size={32} />
                </div>
            }>
                <Categories />
            </Suspense>
        </div>
    );
};

export default Page;