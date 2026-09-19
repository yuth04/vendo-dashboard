export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    image: string;
    role: string;
    is_verified: boolean;
    token: string;
    email_verified_at?: string | null;
}

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface LoginResponse {
    message: string;
    user: User;
}