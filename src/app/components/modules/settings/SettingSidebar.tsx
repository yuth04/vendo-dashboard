'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import React, {useEffect, useState} from "react"
import { LuLayoutGrid } from "react-icons/lu";
import { BsSliders2 } from "react-icons/bs";
import { Globe, Layers, Settings, UserCircleIcon, Menu, X } from 'lucide-react';
import { SiBrandfetch } from "react-icons/si";

const SettingSidebar = () => {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [showMobileHeader, setShowMobileHeader] = useState(false)

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const handleScroll = () => {
            setShowMobileHeader(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setShowMobileHeader(false);
            }, 1000);
        };

        // Listen on both window and document to cover all scroll containers
        window.addEventListener("scroll", handleScroll, true);
        document.addEventListener("scroll", handleScroll, true);

        return () => {
            window.removeEventListener("scroll", handleScroll, true);
            document.removeEventListener("scroll", handleScroll, true);
            clearTimeout(timeout);
        };
    }, []);

    const ICON_CLASS = "w-5 h-5 transition-transform duration-300 group-hover:scale-110";

    const menuItems = [
        {
            label: "General",
            href: "/admin/settings/general",
            icon: <Globe className={ICON_CLASS} />
        },
        {
            label: "Account Info",
            href: "/admin/settings/account-info",
            icon: <UserCircleIcon className={ICON_CLASS} />
        },
        {
            label: "Parent Category",
            href: "/admin/settings/parent-category",
            icon: <Layers className={ICON_CLASS} />
        },
        {
            label: "Sliders",
            href: "/admin/settings/sliders",
            icon: <BsSliders2 className={ICON_CLASS} />
        },
        {
            label: "Brands",
            href: "/admin/settings/brands",
            icon: <SiBrandfetch className={ICON_CLASS} />
        },
        {
            label: "Categories",
            href: "/admin/settings/categories",
            icon: <LuLayoutGrid className={ICON_CLASS} />
        },
    ];

    const MenuContent = () => (
        <div className="space-y-2">
            {menuItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 active:scale-95 ${
                            isActive
                                ? "bg-emerald-100 text-cyan-500 shadow-sm"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }`}>
                        <div className={`${
                            isActive ? "custom-main-color-text" : "text-gray-400 group-hover:text-gray-900"
                        }`}>
                            {item.icon}
                        </div>
                        <span className={`text-sm font-black tracking-tight ${
                            isActive ? "custom-main-color-text" : "text-gray-500"
                        }`}>
                        {item.label}
                        </span>
                        {isActive && (
                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-red-600"/>
                        )}
                    </Link>
                );
            })}
        </div>
    );

    return (
        <>
            {/* Mobile Trigger Button Bar */}
            <div
                className={`lg:hidden fixed top-12 left-0 right-0 z-50 px-4 pt-4 transition-all duration-300 ${
                    showMobileHeader
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-full opacity-0 pointer-events-none"
                }`}
            >
                <div className="flex items-center justify-between p-4 card-theme rounded-2xl shadow-sm border border-gray-100 bg-white dark:bg-neutral-900">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 custom-main-color-card rounded-full flex items-center justify-center custom-main-color-icon shrink-0">
                            <Settings size={18}/>
                        </div>
                        <span className="text-sm font-bold text-[var(--header-text)] truncate">
                            System Settings
                        </span>
                    </div>

                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black custom-main-color-text hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <Menu size={16}/>
                        Tabs
                    </button>
                </div>
            </div>

            {/* Off-Canvas Drawer Backdrop */}
            <div
                className={`fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsOpen(false)}
            >
                {/* Drawer */}
                <div
                    className={`fixed top-0 left-0 bottom-0 w-[290px] card-theme p-5 shadow-2xl flex flex-col gap-5 transition-transform duration-300 ease-out h-full overflow-y-auto ${
                        isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-b-gray-50/50">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Settings size={18} className="custom-main-color-text shrink-0"/>
                            <h2 className="text-md font-black text-[var(--header-text)] truncate tracking-tight">
                                System Settings
                            </h2>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer text-gray-400 hover:text-gray-600"
                        >
                            <X size={18}/>
                        </button>
                    </div>

                    <div className="flex-1">
                        <MenuContent/>
                    </div>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block rounded-[40px] card-theme p-6 shadow-sm overflow-hidden sticky top-6">
                <div className="py-2 mb-6">
                    <h1 className="text-2xl font-bold text-[var(--header-text)] flex items-center gap-2">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 custom-main-color-card rounded-full flex items-center justify-center custom-main-color-icon">
                            <Settings size={22}/>
                        </div>
                        System Settings
                    </h1>
                </div>
                <MenuContent/>
            </div>
        </>
    )
}

export default SettingSidebar;