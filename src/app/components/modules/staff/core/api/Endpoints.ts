import {BASE_URL} from "@/src/app/components/services/utils/config";


export const Endpoints = {
    //----get----//
    staffs: `${BASE_URL}/api/v1/admin/users/staff`,

    //---- post-update-delete ----//
    staffrole: `${BASE_URL}/api/v1/admin/users/role`,
    staffupdate: `${BASE_URL}/api/v1/admin/users`,

    //---export---//
    staffsexcel: `${BASE_URL}/api/v1/staffs/excel`,
    staffspdf: `${BASE_URL}/api/v1/staffs/pdf`,
};