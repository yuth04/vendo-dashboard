import {LoginCredentials, LoginResponse, User} from "@/src/app/components/modules/auth/core/models/authModel";
import {ENDPOINTS} from "@/src/app/components/modules/auth/core/api/endpoints";
import {apiClient} from "@/src/app/components/services/api/apiClient";


const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const ALLOWED_ROLES = ['super-admin', 'admin', 'staff'];

const notifyAuthUpdate = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-updated'));
    }
};

export const authClient = {
    //--------- Login ----------//
    login: async (credentials: LoginCredentials): Promise<LoginResponse | null> => {
        const response = await apiClient.post<LoginResponse>(ENDPOINTS.login, credentials);

        if (response.error || !response.data) {
            throw {
                response: {
                    data: {
                        message: response.error?.message || 'Login failed.',
                        errors: (response.error as any)?.data?.errors ?? null,
                    },
                },
            };
        }

        const data = response.data;

        if (!ALLOWED_ROLES.includes(data.user.role)) {
            throw {
                response: {
                    data: { message: 'Access denied. You do not have the required privileges.' }
                }
            };
        }

        if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, data.user.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }

        notifyAuthUpdate();
        return data;
    },

    //--------- Get Profile ----------//
    getProfile: async (): Promise<User | null> => {
        const response = await apiClient.get<User>('/api/v1/profile');

        if (response.error || !response.data) {
            return null;
        }

        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_KEY, JSON.stringify(response.data));
        }
        return response.data;
    },

    //--------- Logout ----------//
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            window.location.href = '/admin/login';
        }
    }
};