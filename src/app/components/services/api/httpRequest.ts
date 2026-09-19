import { Models } from '../utils/models';

export async function httpRequest<T>(url: string, options: Models = {}): Promise<{ data: T | null; error: any }> {
    const { token, signal, body, method = 'GET', responseType } = options;

    const isFormData = body instanceof FormData;
    const headers: Record<string, string> = {
        'Accept': responseType === 'blob' ? '*/*' : 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
        method,
        headers,
        signal,
    };

    const methodsWithBody = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (body !== undefined && methodsWithBody.includes(method)) {
        config.body = isFormData ? body : JSON.stringify(body);
    }

    try {
        const res = await fetch(url, config);

        // --- FIX: Handle Binary Data ---
        if (responseType === 'blob' && res.ok) {
            const blob = await res.blob();
            return { data: blob as unknown as T, error: null };
        }

        const text = await res.text();
        let data: any = {};

        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            if (!res.ok) {
                return {
                    data: null,
                    error: {
                        message: `Server Error (${res.status})`,
                        code: String(res.status),
                        details: text.substring(0, 200),
                    },
                };
            }
            data = {};
        }

        if (!res.ok) {
            return {
                data: null,
                error: {
                    message: data?.message || `Request failed with status ${res.status}`,
                    code: String(res.status),
                    details: data,
                },
            };
        }

        return { data: data as T, error: null };

    } catch (err: any) {
        if (err?.name === 'AbortError') return { data: null, error: { message: 'Request aborted' } };
        return { data: null, error: { message: err?.message || 'Network error' } };
    }
}