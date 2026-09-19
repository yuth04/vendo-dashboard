export interface AuditUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    image: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    status: string;
    image: string | null;
    image_file_id: string | null;
    created_by: AuditUser | null;
    updated_by: AuditUser | null;
}

export interface UserListResponse {
    message: string;
    users?: User[];
    user?: User;
}