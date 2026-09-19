export interface AuditLogAdmin {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    image: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Admin {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    status: string;
    image: string | null;
    image_file_id: string | null;
    created_at: string;
    updated_at: string;
    created_by?: AuditLogAdmin;
    updated_by?: AuditLogAdmin;
}

export interface AdminListResponse {
    message: string;
    users: Admin[];
    user?: Admin;
}