import type { Metadata, Viewport } from "next";
import "@/src/app/components/assets/scss/_customScss.scss";
import "@/src/app/components/assets/scss/tailwind.config.css";
import ClientProviders from "@/src/app/components/providers/ClientProviders";
import React from "react";

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://vendo-admin-panel.vercel.app/admin/login"),
    title: {
        default: "Vendo Admin Panel",
        template: "%s | Vendo Admin"
    },
    description: "Secure, high-performance administrative console for managing Vendo e-commerce operations, inventory, analytics, and user reviews.",
    keywords: ["e-commerce dashboard", "admin console", "vendo panel", "management software"],
    authors: [{ name: "Vendo Development Team" }],
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
        },
    },
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/icon.png", type: "image/png", sizes: "32x32" },
        ],
        apple: [
            { url: "/apple-icon.png", sizes: "180x180" },
        ],
    },
    openGraph: {
        title: "Vendo - Admin Panel",
        description: "Centralized operational management platform for Vendo E-Commerce.",
        type: "website",
        siteName: "Vendo Admin",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                            (function() {
                                try {
                                    var theme = localStorage.getItem('theme');
                                    var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                                    if (!theme && supportDarkMode) theme = 'dark';
                                    if (!theme) theme = 'light';
                                    document.documentElement.setAttribute('data-theme', theme);
                                    if (theme === 'dark') document.documentElement.classList.add('dark');

                                    var primaryColor = localStorage.getItem('theme-primary-color');
                                    var bgSystemColor = localStorage.getItem('theme-bg-color');
                                    var buttonSystemColor = localStorage.getItem('theme-button-color');
                                    var rootStyle = document.documentElement.style;

                                    if (primaryColor) {
                                        rootStyle.setProperty('--main-text', primaryColor);
                                        rootStyle.setProperty('--main-icon', primaryColor);
                                        rootStyle.setProperty('--main-hover-text', primaryColor);
                                        rootStyle.setProperty('--main-hover-border', primaryColor);
                                        rootStyle.setProperty('--main-color-border', primaryColor);
                                        rootStyle.setProperty('--main-border-color-card', primaryColor);
                                    }
                                    if (bgSystemColor) {
                                        rootStyle.setProperty('--main-bg', bgSystemColor);
                                    }
                                    if (buttonSystemColor) {
                                        rootStyle.setProperty('--main-button', buttonSystemColor);
                                        rootStyle.setProperty('--main-hover-button', buttonSystemColor);
                                    }
                                } catch (e) {}
                            })();
                        `,
                }}
            />
        </head>
        <body className="antialiased">
        <ClientProviders>
            {children}
        </ClientProviders>
        </body>
        </html>
    );
}