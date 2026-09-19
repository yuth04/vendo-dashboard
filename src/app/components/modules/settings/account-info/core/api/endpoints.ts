import {BASE_URL} from "@/src/app/components/services/utils/config";


export const ENDPOINTS = {
    //---- post-update-delete ----//
    changename: `${BASE_URL}/api/v1/admin/settings/change-name`,
    changepassword: `${BASE_URL}/api/v1/admin/settings/change-password`,
    changeimageprofile: `${BASE_URL}/api/v1/admin/settings/change-avatar`,
};