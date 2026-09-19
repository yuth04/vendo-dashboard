import {BASE_URL} from "@/src/app/components/services/utils/config";


export const ENDPOINTS = {

    //--return-status--//
    returns: `${BASE_URL}/api/v1/admin/returns`,
    returndetails: `${BASE_URL}/api/v1/admin/return-details`,
    returnsapprove: `${BASE_URL}/api/v1/admin/returns/approve`,
    returnscomplete: `${BASE_URL}/api/v1/admin/returns/complete`,
    returnsreject: `${BASE_URL}/api/v1/admin/returns/reject`,

    //--export--//
    returnhistoryexel: `${BASE_URL}/api/v1/returns-history/excel`,
    returnhistorypdf: `${BASE_URL}/api/v1/returns-history/pdf`,

};