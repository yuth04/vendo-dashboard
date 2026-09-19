import {BASE_URL} from "@/src/app/components/services/utils/config";


export const ENDPOINTS = {

    orderhistory: `${BASE_URL}/api/v1/admin/pos-orders`,
    orderdetails: `${BASE_URL}/api/v1/admin/order-details`,

    //--export--//
    ordersexport: `${BASE_URL}/api/v1/orders/excel`,
    orderspdf: `${BASE_URL}/api/v1/orders-history/pdf`,

};