'use client';
import { ApiResponse, ApiError } from './models';
import { useEffect, useRef, useState, useCallback } from 'react';

export function useApiData<T>(
    fetchFn: (signal?: AbortSignal) => Promise<ApiResponse<T>>,
    defaultValue?: T,
    enableClientFetch: boolean = false,
) {
    const [data, setData] = useState<T | undefined>(defaultValue);
    const [error, setError] = useState<ApiError | null>(null);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);

    const defaultValueRef = useRef(defaultValue);

    // Renamed to avoid Next.js keyword conflicts
    const refetchData = useCallback(() => {
        setCount(prev => prev + 1);
    }, []);

    useEffect(() => {
        if (!enableClientFetch) return;

        const controller = new AbortController();
        setLoading(true);

        fetchFn(controller.signal)
            .then((res) => {
                if (res.error) {
                    setError(res.error);
                    setData(defaultValueRef.current);
                } else {
                    setData(res.data ?? defaultValueRef.current);
                    setError(null);
                }
            })
            .catch((err) => {
                if (!controller.signal.aborted) {
                    setError({ message: err.message ?? 'Unknown error', code: 'FETCH_ERROR' });
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();

    }, [fetchFn, enableClientFetch, count]);

    return { data, error, loading, refetchData };
}