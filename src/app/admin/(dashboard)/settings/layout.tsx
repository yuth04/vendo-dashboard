import React from "react"
import SettingSidebar from "@/src/app/components/modules/settings/SettingSidebar";

export default function AccountsLayout({
                                           children,
                                       }: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen sm:p-6 py-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-10">

                <div className="lg:w-1/4">
                    <SettingSidebar/>
                </div>

                <div className="lg:w-3/4 px-4 py-3 rounded-2xl shadow-sm bg-[var(--header-bg)] card-theme">
                    {children}
                </div>

            </div>
        </div>
    )
}