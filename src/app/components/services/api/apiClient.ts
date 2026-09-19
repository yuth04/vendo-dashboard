import { Models } from '../utils/models';
import { httpRequest } from './httpRequest';

const TOKEN_KEY = 'auth_token';

function getToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return localStorage.getItem(TOKEN_KEY) ?? undefined;
}

function withAuth(options?: Models): Models {
    return { ...options, token: options?.token ?? getToken() };
}

export const apiClient = {
    get: <T>(url: string, options?: Models) =>
        httpRequest<T>(url, { ...withAuth(options), method: 'GET' }),

    post: <T>(url: string, body?: any, options?: Models) =>
        httpRequest<T>(url, { ...withAuth(options), method: 'POST', body }),

    put: <T>(url: string, body?: any, options?: Models) =>
        httpRequest<T>(url, { ...withAuth(options), method: 'PUT', body }),

    patch: <T>(url: string, body?: any, options?: Models) =>
        httpRequest<T>(url, { ...withAuth(options), method: 'PATCH', body }),

    delete: <T>(url: string, options?: Models) =>
        httpRequest<T>(url, { ...withAuth(options), method: 'DELETE' }),
};