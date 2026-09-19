import {BASE_URL} from "@/src/app/components/services/utils/config";


export const ENDPOINTS = {

    onlineorder: `${BASE_URL}/api/v1/admin/pos-orders`,
    orderdetails: `${BASE_URL}/api/v1/admin/order-details`,

    //--order-status--//
    statusconfirm: `${BASE_URL}/api/v1/admin/orders/confirm`,
    statusship: `${BASE_URL}/api/v1/admin/orders/ship`,
    statusdeliver: `${BASE_URL}/api/v1/admin/orders/deliver`,
    statuspayment: `${BASE_URL}/api/v1/admin/orders/payment`,
    statuscomplete: `${BASE_URL}/api/v1/admin/orders/complete`,

    //--export--//
    ordersexport: `${BASE_URL}/api/v1/orders/excel`,
    orderspdf: `${BASE_URL}/api/v1/orders-history/pdf`,
    invoice: `${BASE_URL}/api/v1/orders`,

};