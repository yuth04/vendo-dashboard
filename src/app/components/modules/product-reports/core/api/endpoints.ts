import {BASE_URL} from "@/src/app/components/services/utils/config";


export const ENDPOINTS = {
    //----get----//
    productreports:`${BASE_URL}/api/v1/admin/product-reports`,

    //--export--//
    productsreportexcel: `${BASE_URL}/api/v1/products-report/excel`,
    productsreportpdf: `${BASE_URL}/api/v1/products-report/pdf`,
};