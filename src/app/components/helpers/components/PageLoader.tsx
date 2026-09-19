import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoader = () => {
    return (
        <div className="flex-1 w-full min-h-[calc(100vh-12rem)] flex items-center justify-center p-6">
            <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin custom-main-color-text" size={40} />
            </div>
        </div>
    );
};