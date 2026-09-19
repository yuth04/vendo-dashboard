/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * HTTP methods supported by the API helper
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Models
 * Standardized request options for API calls.
 */
export interface Models extends Omit<RequestInit, 'method' | 'body'> {
    method?: HttpMethod;
    token?: string;
    body?: any;
    retries?: number;
    params?: Record<string, string | number | boolean>;
    timeoutMs?: number;
    contentType?: string;
    /**
     * Optional: Specify the expected response format.
     * Required for binary data like file exports.
     */
    responseType?: 'blob' | 'json' | 'text' | 'arraybuffer';
}

/**
 * ApiError
 * Standardized error object returned by API helpers.
 */
export interface ApiError {
    status?: number;
    code?: string;
    message: string;
    data?: any;
}

/**
 * ApiResponse<T>
 * Standardized response wrapper returned by API helpers.
 */
export interface ApiResponse<T> {
    status?: string;
    message?: string;
    data: T | null;
    error: ApiError | null;
    success?: boolean;
}