"use client";

import React, { useState } from "react";
import Sidebar from "@/src/app/components/layout/sidebar/Sidebar";
import Header from "@/src/app/components/layout/header/Header";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="relative flex h-dvh w-full overflow-hidden bg-[#0e1012]">

            {mobileOpen && (
                <div
                    className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <div
                className={`
                    fixed inset-y-0 left-0 z-[120]
                    lg:static lg:z-auto
                    transition-all duration-300 ease-in-out
                    ${mobileOpen ? "translate-x-0 w-[260px]" : "-translate-x-full w-[260px]"}
                    lg:translate-x-0
                    ${collapsed ? "lg:w-[70px]" : "lg:w-[260px]"}
                `}
            >
                <Sidebar
                    onClose={() => setMobileOpen(false)}
                    collapsed={collapsed}
                    onToggleCollapse={() => setCollapsed(!collapsed)}
                />
            </div>

            <div className="flex-1 flex flex-col min-w-0 h-dvh overflow-hidden">
                <Header onMenuClick={() => setMobileOpen(true)} />

                <main className="flex-1 overflow-y-auto bg-[var(--header-bg)] relative">
                    <div className="p-4 md:p-6 lg:p-8 min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}