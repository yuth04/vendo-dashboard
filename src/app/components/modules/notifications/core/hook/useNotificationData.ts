'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ApiResponse } from "@/src/app/components/services/utils/models";

interface NotificationApiError {
    message: string;
    code?: string | number;
}

export function useNotificationData<T>(
    fetchFn: (signal?: AbortSignal) => Promise<ApiResponse<T>>,
    defaultValue?: T,
    enableClientFetch: boolean = false,
) {
    const [data, setData] = useState<T | undefined>(defaultValue);
    const [error, setError] = useState<NotificationApiError | null>(null);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);

    const defaultValueRef = useRef(defaultValue);

    const refetchData = useCallback(() => {
        setCount(prev => prev + 1);
    }, []);

    useEffect(() => {
        if (!enableClientFetch) return;

        const controller = new AbortController();
        setLoading(true);

        fetchFn(controller.signal)
            .then((res) => {
                if (controller.signal.aborted) return; // ← stale response guard

                if (res.error) {
                    setError(res.error as NotificationApiError);
                    setData(defaultValueRef.current);
                } else {
                    setData(res.data ?? defaultValueRef.current);
                    setError(null);
                }
            })
            .catch((err) => {
                if (controller.signal.aborted) return;
                setError({
                    message: err.message ?? 'Unknown error',
                    code: 'FETCH_ERROR'
                });
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();

    }, [fetchFn, enableClientFetch, count]);

    return { data, error, loading, refetchData };
}