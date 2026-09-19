import {BASE_URL} from "@/src/app/components/services/utils/config";


export const ENDPOINTS = {

    //----get-post-update-delete ----//
    categories:`${BASE_URL}/api/v1/admin/categories`,
    products:`${BASE_URL}/api/v1/admin/products`,
    brands:`${BASE_URL}/api/v1/admin/brands`,
    variants:`${BASE_URL}/api/v1/admin/product-variants`,
    adminproducts:`${BASE_URL}/api/v1/admin/products`,
    adminproductvariants:`${BASE_URL}/api/v1/admin/product-variants`,

    //--export--//
    productsexport: `${BASE_URL}/api/v1/products/excel`,
    productsexportpdf: `${BASE_URL}/api/v1/products-history/pdf`,

};