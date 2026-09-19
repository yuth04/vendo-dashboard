import React from 'react';
import DetailsOrder from "@/src/app/components/modules/online-orders/components/DetailsOrder";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}


const Page = async ({ params }: PageProps) => {

    const decodedParams = await params;
    const id = decodedParams.id;

    return (
        <div>
            <DetailsOrder orderId={id} />
        </div>
    );
};

export default Page;