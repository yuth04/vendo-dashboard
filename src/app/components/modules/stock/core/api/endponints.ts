import {BASE_URL} from "@/src/app/components/services/utils/config";


export const ENDPOINTS = {
    //----get-post-update-delete ----//
    categories:`${BASE_URL}/api/v1/admin/categories`,
    adminproductvariants:`${BASE_URL}/api/v1/admin/product-variants`,
    products:`${BASE_URL}/api/v1/admin/products`,
    brands:`${BASE_URL}/api/v1/admin/brands`,
    variants:`${BASE_URL}/api/v1/admin/product-variants`,

    stocksexcel: `${BASE_URL}/api/v1/stocks/excel`,
    stockspdf: `${BASE_URL}/api/v1/stocks/pdf`,
};