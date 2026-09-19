import React from 'react';
import DetailsHistoryOrder from "@/src/app/components/modules/history-orders/components/DetailsHistoryOrder";

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
            <DetailsHistoryOrder orderId={id} />
        </div>
    );
};

export default Page;