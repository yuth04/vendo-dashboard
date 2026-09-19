import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShieldAlert, LucideIcon } from 'lucide-react';

interface DataNotFoundProps {
    title?: string;
    message?: string;
    icon?: LucideIcon;
}

export const DataNotFound = ({
                                 title = "",
                                 message = "",
                                 icon: IconComponent = ShieldAlert
                             }: DataNotFoundProps) => {
    const router = useRouter();

    return (
        <div className="flex-1 w-full min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center p-6 text-center">
            <div className="flex flex-col items-center justify-center max-w-sm">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <IconComponent size={32} />
                </div>
                <h2 className="text-xl font-black text-[var(--header-text)] mb-2">{title}</h2>
                <p className="text-gray-500 mb-6 text-sm">{message}</p>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-6 py-3 custom-main-color-button text-white rounded-2xl font-bold shadow-lg transition-all cursor-pointer"
                >
                    <ChevronLeft size={18} /> Go Back
                </button>
            </div>
        </div>
    );
};