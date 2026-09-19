import {BASE_URL} from "@/src/app/components/services/utils/config";


export const ENDPOINTS = {
    //----get----//
    users: `${BASE_URL}/api/v1/admin/users`,

    //---- post-update-delete ----//
    usersrole: `${BASE_URL}/api/v1/admin/users/role`,

    //---export---//
    customersexcel: `${BASE_URL}/api/v1/customers/excel`,
    customerspdf: `${BASE_URL}/api/v1/customers/pdf`,
};