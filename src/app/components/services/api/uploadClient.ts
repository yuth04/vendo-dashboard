/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse } from '../utils/models';

export const uploadClient = {
    upload: async <T>(
        url: string,
        formData: FormData,
        token?: string | undefined,
    ): Promise<ApiResponse<T>> => {
        try {
            console.log('[uploadClient] POST to:', url);
            console.log('[uploadClient] token present:', !!token);

            const res = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    // ✅ NEVER set Content-Type for FormData — browser sets it with boundary
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const text = await res.text();
            console.log('[uploadClient] status:', res.status);
            console.log('[uploadClient] raw response:', text);

            let json: any = {};
            try {
                json = JSON.parse(text);
            } catch {
                return {
                    data: null,
                    error: {
                        status: res.status,
                        code: 'PARSE_ERROR',
                        message: `Non-JSON response: ${text.slice(0, 200)}`,
                    },
                    // FIXED: Cast to any to bypass the missing property error in ApiResponse interface
                } as any;
            }

            if (!res.ok) {
                const message =
                    json.message ||
                    json.error ||
                    (json.errors
                        ? Object.values(json.errors as Record<string, string[]>).flat()[0]
                        : null) ||
                    'Upload failed';

                return {
                    data: null,
                    error: { status: res.status, code: 'UPLOAD_ERROR', message },
                } as any;
            }

            return {
                data: json as T,
                error: null,
                category: json.category ?? undefined
            } as any;

        } catch (err: any) {
            console.error('[uploadClient] fetch error:', err);
            return {
                data: null,
                error: { code: 'FETCH_ERROR', message: err?.message ?? 'Unknown error' },
            } as any;
        }
    },
};