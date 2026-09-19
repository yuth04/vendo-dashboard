"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    Settings,
    PanelLeftClose,
    PanelLeftOpen,
    X, Boxes, UserCog, Undo2, BarChart3, PackageSearch, PackageX, BadgePercent, MessageSquare, ShieldCheck
} from "lucide-react";
import { AiOutlineHistory } from "react-icons/ai";
import { LuBox } from "react-icons/lu";
import {User} from "@/src/app/components/modules/auth/core/models/authModel";
import {authClient} from "@/src/app/components/modules/auth/core/api/authClient";

const menuGroups = [
    {
        title: null,
        items: [
            { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
        ]
    },
    {
        title: "PRODUCT & STOCK",
        items: [
            { name: "Products", icon: LuBox, href: "/admin/products" },
            { name: "Stocks", icon: Boxes, href: "/admin/stock" },
            { name: "Damages", icon: PackageX, href: "/admin/damage" },
        ]
    },
    {
        title: "PROMOTION & COUPONS",
        items: [
            {
                name: "Promotions",
                icon: () => (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                        <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14" />
                        <path d="M8 6v8" />
                    </svg>
                ),
                href: "/admin/promotions",
            },
            { name: "Coupons", icon: BadgePercent, href: "/admin/coupons" },
        ]
    },
    {
        title: "REVIEWS & CHAT BOT",
        items: [
            { name: "Products Reviews", icon:  MessageSquare, href: "/admin/product-reviews" },
        ]
    },
    {
        title: "ORDERS & Return ORDERS",
        items: [
            { name: "History Orders", icon: AiOutlineHistory, href: "/admin/history-orders" },
            { name: "Online Orders", icon: ShoppingCart, href: "/admin/online-orders" },
            { name: "Customer Return", icon: Undo2, href: "/admin/customer-return" },
        ]
    },
    {
        title: "ADMIN & USERS",
        items: [
            { name: "Admins", icon: ShieldCheck, href: "/admin/admin" },
            { name: "Staffs", icon: UserCog, href: "/admin/staff" },
            { name: "Customers", icon: Users, href: "/admin/customers" },
        ]
    },
    {
        title: "REPORTS",
        items: [
            { name: "Sales Report", icon:  BarChart3, href: "/admin/sales-reports" },
            { name: "Products Report", icon: PackageSearch, href: "/admin/product-reports" },
        ]
    },
    {
        title: "SYSTEMS",
        items: [
            { name: "Settings", icon: Settings, href: "/admin/settings/general" },
        ]
    }
];

interface SidebarProps {
    onClose?: () => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

const Sidebar = ({ onClose, collapsed, onToggleCollapse }: SidebarProps) => {
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);

    const syncUser = () => {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Sidebar: Failed to parse user", error);
            }
        }
    };

    useEffect(() => {
        syncUser();
        authClient.getProfile().then((profile) => {
            if (profile) setUser(profile);
        });
        window.addEventListener("storage", syncUser);
        window.addEventListener("local-user-update", syncUser);
        return () => {
            window.removeEventListener("storage", syncUser);
            window.removeEventListener("local-user-update", syncUser);
        };
    }, []);

    // Dynamically filter configuration blocks according to security permissions
    const filteredMenuGroups = useMemo(() => {
        const isStaff = user?.role === 'staff';

        return menuGroups
            .filter(group => {
                // If user is staff, hide the entire PROMOTION & COUPONS and SYSTEMS sections
                if (isStaff && (group.title === "PROMOTION & COUPONS" || group.title === "SYSTEMS")) {
                    return false;
                }
                return true;
            })
            .map(group => {
                // Filter individual items inside remaining menu categories
                const items = isStaff
                    ? group.items.filter(item => item.href !== "/admin/admin")
                    : group.items;

                return { ...group, items };
            })
            .filter(group => group.items.length > 0);
    }, [user?.role]);

    const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : "A";

    return (
        <aside className="flex flex-col h-full custom-main-color-card border-r border-white/[0.06] text-white">
            {/* LOGO SECTION */}
            <div className={`flex items-center h-[60px] border-b border-white/[0.06] ${collapsed ? "justify-center" : "justify-between px-4"}`}>
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 custom-main-color-bg rounded-[50px] flex-shrink-0 flex items-center justify-center text-[#111315] font-black">
                        V
                    </div>
                    {!collapsed && <span className="font-bold tracking-tight text-[16px] sm:text-[18px] whitespace-nowrap text-white">AdminPanel</span>}
                </div>

                <button onClick={onClose} className="lg:hidden p-1.5 text-white/40 hover:text-white">
                    <X size={18} />
                </button>

                {!collapsed && (
                    <button onClick={onToggleCollapse} className="hidden lg:flex p-1 text-white/30 hover:text-white transition-colors cursor-pointer">
                        <PanelLeftClose size={16} />
                    </button>
                )}
            </div>

            {collapsed && (
                <button onClick={onToggleCollapse} className="hidden lg:flex mx-auto mt-4 p-2 text-white/30 hover:text-white cursor-pointer">
                    <PanelLeftOpen size={18} />
                </button>
            )}

            {/* NAV LINKS WITH TITLES */}
            <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-none">
                {filteredMenuGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-1">
                        {group.title && !collapsed && (
                            <p className="px-3 mb-2 text-[12px] font-black custom-main-color-text uppercase tracking-[1px]">
                                {group.title}
                            </p>
                        )}
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => { if (window.innerWidth < 1024) onClose?.(); }}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                        isActive
                                            ? "custom-main-color-bg text-[#111315] shadow-lg shadow-black/10"
                                            : "text-white/50 hover:bg-white/5 hover:text-white"
                                    } ${collapsed ? "justify-center" : ""}`}
                                >
                                    <Icon size={18} className={isActive ? "text-[#111315]" : "text-white/30"} />
                                    {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* USER BOX */}
            <div className="p-3 border-t border-white/[0.06]">
                <div className={`flex items-center gap-3 p-2 bg-white/[0.03] rounded-2xl border border-white/[0.05] ${collapsed ? "justify-center" : ""}`}>
                    <div className="w-8 h-8 rounded-full custom-main-color-bg flex-shrink-0 flex items-center justify-center font-bold text-[#111315] text-xs overflow-hidden">
                        {user?.image ? (
                            <Image
                                src={user.image}
                                alt="Avatar"
                                width={32}
                                height={32}
                                unoptimized
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span>{initial}</span>
                        )}
                    </div>
                    {!collapsed && (
                        <div className="truncate min-w-0 flex-1">
                            <p className="text-[14px] font-bold truncate leading-tight text-white">
                                {user ? `${user.first_name} ${user.last_name}` : ""}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                  <span className="text-[12px] font-semibold text-white/70">
                                    {user?.role ?? "Admin"}
                                  </span>
                                <p className="text-[12px] font-semibold text-white/70">
                                    Account
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;