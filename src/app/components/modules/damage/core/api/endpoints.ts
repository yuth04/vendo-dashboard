import {BASE_URL} from "@/src/app/components/services/utils/config";


export const ENDPOINTS = {

    productdamages:`${BASE_URL}/api/v1/admin/product-damages`,

    //---export-----//
    damagesexcel: `${BASE_URL}/api/v1/product-damages/excel`,
    damagespdf: `${BASE_URL}/api/v1/product-damages/pdf`,

};