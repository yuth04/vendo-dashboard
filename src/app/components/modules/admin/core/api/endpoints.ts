import {BASE_URL} from "@/src/app/components/services/utils/config";


export const ENDPOINTS = {
    //----get----//
    admins: `${BASE_URL}/api/v1/admin/users`,

    //---- post-update-delete ----//
    adminrole: `${BASE_URL}/api/v1/admin/users/role`,
    adminroles: `${BASE_URL}/api/v1/admin/users/admins`,

    //---export---//
    adminsexcel: `${BASE_URL}/api/v1/admins/excel`,
    adminspdf: `${BASE_URL}/api/v1/admins/pdf`,
};