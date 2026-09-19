import {BASE_URL} from "@/src/app/components/services/utils/config";


export const ENDPOINTS = {
    //----get----//
    categories:`${BASE_URL}/api/v1/admin/categories`,
    parentcategory:`${BASE_URL}/api/v1/admin/parent-categories`,

    //---- post-update-delete ----//
    admincategories:`${BASE_URL}/api/v1/admin/categories`,
};