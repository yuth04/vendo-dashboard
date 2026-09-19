"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  Menu,
  LogOut,
  ChevronRight,
  UserCircleIcon,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import DarkMode from "@/src/app/components/helpers/dark-mode/DarkMode";
import Link from "next/link";
import { useAlert } from "@/src/app/components/context/AlertContext";
import NotificationDrawer from "../../modules/notifications/components/NotificationDrawer";
import { useNotification } from "@/src/app/components/context/NotificationContext";
import { authClient } from "@/src/app/components/modules/auth/core/api/authClient";
import { User } from "@/src/app/components/modules/auth/core/models/authModel";

const pageTitles: Record<string, string> = {
  "/admin/Dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/stock": "Stocks",
  "/admin/damage": "Damages",
  "/admin/promotions": "Promotions",
  "/admin/coupons": "Coupons",
  "/admin/product-reviews": "Products Reviews",
  "/admin/admin": "Admins",
  "/admin/staff": "Staffs",
  "/admin/customers": "Customers",
  "/admin/history-orders": "History Orders",
  "/admin/online-orders": "Online Orders",
  "/admin/customer-return": "Customer Return",
  "/admin/settings": "Settings",
  "/admin/sales-reports": "Sales Reports",
  "/admin/product-reports": " Products Report",
  "/admin/settings/brands": "Brands",
  "/admin/settings/categories": "Categories",
  "/admin/settings/sliders": "Sliders",
  "/admin/settings/parent-category": "Parent Category",
  "/admin/settings/account-info": "Account Info",
  "/admin/settings/general": "General",
};

const Header = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useAlert();
  const { unreadCount } = useNotification();
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic title guard matching Sidebar access restrictions for staff
  const title = (() => {
    if (user?.role === "staff") {
      const isTabForbidden =
        pathname.startsWith("/admin/admin") ||
        pathname.startsWith("/admin/promotions") ||
        pathname.startsWith("/admin/coupons") ||
        pathname.startsWith("/admin/settings");

      if (
        isTabForbidden &&
        !pathname.includes("/admin/settings/account-info")
      ) {
        return "Dashboard";
      }
    }
    return pageTitles[pathname] ?? "Dashboard";
  })();

  const initial = user?.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : "A";

  const syncUser = () => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
      }
    }
  };

  useEffect(() => {
    setIsMounted(true);
    syncUser();
    authClient.getProfile().then((profile) => {
      if (profile) {
        setUser(profile);
      }
    });

    window.addEventListener("storage", syncUser);
    window.addEventListener("local-user-update", syncUser);

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("local-user-update", syncUser);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsDropdownOpen(false);
      showToast("Logged out successfully. Redirecting...", "success");

      await authClient.logout();
      setTimeout(() => {
        router.replace("/admin/login");
      }, 1000);
    } catch (error) {
      console.error("Logout failed", error);
      showToast("Failed to log out. Please try again.", "error");
    }
  };

  return (
    <header className="sticky top-0 w-full h-[60px] custom-main-color-card text-white flex items-center justify-between px-3 sm:px-4 border-b border-white/[0.06] flex-shrink-0 z-[100]">
      <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1 mr-2">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-lg text-white/50 hover:bg-white/10 shrink-0"
        >
          <Menu size={26} />
        </button>
        <nav className="flex items-center gap-1 sm:gap-3 text-sm sm:text-lg font-medium min-w-0">
          <Link href="/admin/dashboard" className="shrink-0 hidden sm:block">
            <span className="text-gray-400 sm:text-[16px] text-[14px] sm:text-sm transition-colors cursor-pointer hover:text-white">
              Dashboard
            </span>
          </Link>
          <ChevronRight
            className="text-slate-500 shrink-0 hidden sm:block"
            size={14}
            strokeWidth={2.5}
          />
          <h1 className="font-bold text-gray-50 text-[14px] sm:text-[18px] tracking-tight truncate max-w-[100px] xs:max-w-[150px] sm:max-w-none">
            {title}
          </h1>
        </nav>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="scale-90 sm:scale-100">
          <DarkMode />
        </div>

        {/* Bell Button */}
        <button
          onClick={() => {
            setIsNotificationsOpen(true); // FIX: Removed resetCount() here
          }}
          className="relative p-2 sm:p-2.5 rounded-full bg-white/[0.05] hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Bell size={20} className="text-white" />
          {isMounted && unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-[#111315]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="relative ml-0.5 sm:ml-1" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-white/10"
          >
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[14px] font-medium leading-tight">
                {user ? `${user.first_name} ${user.last_name}` : ""}
              </span>
              <span className="text-[12px] text-white/35">
                {user?.role ?? "Admin"}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full custom-main-color-bg flex items-center justify-center border-2 border-white/10 flex-shrink-0 overflow-hidden cursor-pointer">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-[#111315] font-bold text-xs">
                  {initial}
                </span>
              )}
            </div>
            <ChevronDown
              size={14}
              className={`text-white/35 transition-transform cursor-pointer shrink-0 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-[-4px] sm:right-0 top-14 w-[240px] sm:w-[260px] input-theme rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-gray-100 py-4 px-4 z-[150]">
              <div className="flex items-center gap-3 pb-3 mb-3 border-b custom-main-border">
                <div className="w-10 h-10 rounded-full custom-main-color-bg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt="profile"
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <span className="font-bold text-lg text-gray-800">
                      {initial}
                    </span>
                  )}
                </div>
                <div className="truncate text-left">
                  <p className="text-[14px] sm:text-[16px] font-bold custom-main-color-text truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-[11px] sm:text-[12px] text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                {user?.role !== "staff" && (
                  <Link href="/admin/settings/account-info">
                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 w-full p-2.5 rounded-xl text-[13px] hover:bg-gray-50 cursor-pointer text-gray-400"
                    >
                      <UserCircleIcon size={14} className="text-amber-500" />{" "}
                      Account Info
                    </button>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl text-[13px] text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </header>
  );
};

export default Header;
