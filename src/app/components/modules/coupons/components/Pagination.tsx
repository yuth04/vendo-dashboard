"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number | ((prev: number) => number)) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {

    const getPageNumbers = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 3) {
            return [1, 2, 3, 'ellipsis-end', totalPages];
        }

        if (currentPage >= totalPages - 2) {
            return [1, 'ellipsis-start', totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1];
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-center gap-1">
            <button
                onClick={() => onPageChange(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-1">
                {pageNumbers.map((page, idx) =>
                    page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                        <span
                            key={`${page}-${idx}`}
                            className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center text-gray-400 text-sm font-bold select-none"
                        >
                            •••
                        </span>
                    ) : (
                        <button
                            key={`page-${page}`}
                            onClick={() => onPageChange(page)}
                            className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full text-sm font-bold transition-all cursor-pointer ${
                                currentPage === page
                                    ? 'custom-main-color-bg text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}
            </div>

            <button
                onClick={() => onPageChange(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default Pagination;