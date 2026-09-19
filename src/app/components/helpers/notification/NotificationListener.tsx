"use client";

import { useEffect, useRef } from "react";
import { useNotification } from "@/src/app/components/context/NotificationContext";
import { useAlert } from "@/src/app/components/context/AlertContext";
import {notificationsClient} from "@/src/app/components/modules/notifications/core/api/notificationClient";



export default function NotificationListener() {
    const { incrementCount } = useNotification();
    const { showToast } = useAlert();
    const lastOrderId = useRef<number | null>(null);
    const isInitialized = useRef(false);

    useEffect(() => {
        const checkOrders = async () => {
            try {
                const data = await notificationsClient.getNotifications();
                const orders = data?.orders ?? [];

                if (orders.length === 0) return;

                const latestOrder = orders[0];

                if (!isInitialized.current) {
                    lastOrderId.current = latestOrder.id;
                    isInitialized.current = true;
                    return;
                }

                if (latestOrder.id !== lastOrderId.current) {
                    incrementCount();
                    showToast("New customer order received!", "success");
                    lastOrderId.current = latestOrder.id;
                }
            } catch (error) {
                console.error("Error in NotificationListener:", error);
            }
        };

        const interval = setInterval(checkOrders, 15000);
        checkOrders();

        return () => clearInterval(interval);
    }, [incrementCount, showToast]);

    return null;
}