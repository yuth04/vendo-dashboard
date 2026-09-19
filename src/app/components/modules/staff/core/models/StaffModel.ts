export interface ActivityLogStaff {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    image: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Staff {
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
    created_by?: ActivityLogStaff;
    updated_by?: ActivityLogStaff;
}

export interface StaffListResponse {
    message: string;
    staffs: Staff[];
    user?: Staff;
}