"use client";

import { ThemeProvider } from "@/src/app/components/context/ThemeContext";
import { AuthProvider } from "@/src/app/components/context/AuthContext";
import { AlertProvider } from "@/src/app/components/context/AlertContext";
import { NotificationProvider } from "@/src/app/components/context/NotificationContext";
import React from "react";
import NotificationListener from "@/src/app/components/helpers/notification/NotificationListener";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AlertProvider>
                    <NotificationProvider>
                        <NotificationListener />
                        {children}
                    </NotificationProvider>
                </AlertProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}