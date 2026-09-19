import {BASE_URL} from "@/src/app/components/services/utils/config";


export const ENDPOINTS = {
    //----get----//
    salereports:`${BASE_URL}/api/v1/admin/sale-reports`,

    //--export--//
    salesreportexcel: `${BASE_URL}/api/v1/sales-report/excel`,
    salesreportpdf: `${BASE_URL}/api/v1/sales-report/pdf`,
};