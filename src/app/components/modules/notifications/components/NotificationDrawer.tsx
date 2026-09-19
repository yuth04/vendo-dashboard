"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  X,
  Trash2,
  MoreHorizontal,
  Search,
  CheckCheck,
  ShoppingBag,
  AlertTriangle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useNotification } from "@/src/app/components/context/NotificationContext";
import { useAlert } from "@/src/app/components/context/AlertContext";
import {
  NotificationOrder,
  notificationService,
} from "@/src/app/components/modules/notifications/core/services/notificationService";
import { useNotificationData } from "@/src/app/components/modules/notifications/core/hook/useNotificationData";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "all" | "orders" | "alerts";

const ALERT_TYPES = ["slow_moving", "old_stock", "dead_stock"];

function getKind(n: NotificationOrder): "order" | "alert" {
  return n.type && ALERT_TYPES.includes(n.type) ? "alert" : "order";
}

function isUnread(n: NotificationOrder): boolean {
  return n.is_read !== true && n.is_seen !== true;
}

const NotificationDrawer = ({ isOpen, onClose }: NotificationDrawerProps) => {
  const router = useRouter();
  const { resetCount, decrementCount, setUnreadCount } = useNotification();
  const { showConfirm, showToast } = useAlert();

  const [notifications, setNotifications] = useState<NotificationOrder[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [showAll, setShowAll] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    data: fetchedData,
    loading: hookLoading,
    refetchData,
  } = useNotificationData(notificationService.getNotifications, null, isOpen);

  // Sync API notifications and unread count into local state & context
  useEffect(() => {
    if (fetchedData && fetchedData.data) {
      setNotifications(fetchedData.data);
    } else if (fetchedData === null) {
      setNotifications([]);
    }
  }, [fetchedData]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // DO NOT call resetCount() here so unread badge stays visible when opening drawer
  useEffect(() => {
    if (isOpen) {
      setShowAll(false);
      setIsSearching(false);
      setSearchQuery("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const unreadCount = useMemo(
    () => notifications.filter(isUnread).length,
    [notifications],
  );

  // Mark single notification as read when admin clicks on it
  const handleNotificationClick = (item: NotificationOrder) => {
    const kind = getKind(item);
    const type: "order" | "system" = kind === "order" ? "order" : "system";

    if (isUnread(item)) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === item.id ? { ...n, is_read: true, is_seen: true } : n,
        ),
      );
      // Decrement counter by 1 in global context
      decrementCount();

      notificationService.markAsSeen(item.id, type).catch((error) => {
        console.error("Failed to mark as seen:", error);
      });
    }

    onClose();
    const targetUrl = item.url || `/admin/orders/${item.id}`;
    router.push(targetUrl);
  };

  // Mark all notifications as read when admin clicks "Mark all read"
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);
    const previous = [...notifications];

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, is_seen: true })),
    );
    // Reset badge counter to 0 in global context
    resetCount();

    try {
      await notificationService.markAllAsRead();
      showToast("All notifications marked as read", "success");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      setNotifications(previous);
      showToast("Failed to mark all as read", "error");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setActiveMenuId(null);

    const confirmed = await showConfirm({
      title: "Delete Notification",
      message: "Are you sure you want to delete this notification?",
      confirmLabel: "Delete",
      variant: "danger",
    });

    if (!confirmed) return;

    const previousNotifications = [...notifications];
    const targetItem = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    if (targetItem && isUnread(targetItem)) {
      decrementCount();
    }

    try {
      await notificationService.deleteNotification(id);
      showToast("Notification deleted successfully", "success");
      refetchData();
    } catch (error) {
      console.error("Failed to delete notification:", error);
      setNotifications(previousNotifications);
      showToast("Failed to delete notification", "error");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      (n.first_name || "").toLowerCase().includes(query) ||
      (n.last_name || "").toLowerCase().includes(query) ||
      (n.message || "").toLowerCase().includes(query) ||
      (n.title || "").toLowerCase().includes(query) ||
      n.id.toString().includes(query);

    if (!matchesQuery) return false;

    if (activeTab === "orders") return getKind(n) === "order";
    if (activeTab === "alerts") return getKind(n) === "alert";

    return true;
  });

  const orderCount = notifications.filter((n) => getKind(n) === "order").length;
  const alertCount = notifications.filter((n) => getKind(n) === "alert").length;

  const displayedNotifications = showAll
    ? filteredNotifications
    : filteredNotifications.slice(0, 5);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[340px] sm:w-[420px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-[160] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            {isSearching ? (
              <input
                autoFocus
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <Bell size={16} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                aria-label="Search notifications"
                onClick={() => {
                  setIsSearching(!isSearching);
                  setSearchQuery("");
                }}
                className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  isSearching
                    ? "bg-gray-100 dark:bg-gray-800 text-blue-600"
                    : ""
                }`}
              >
                <Search size={18} />
              </button>
              <button
                aria-label="Close notifications"
                onClick={onClose}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isSearching && (
            <>
              {/* Filter Tabs */}
              <div className="flex bg-gray-100 dark:bg-gray-800/60 p-1 rounded-lg text-xs font-medium">
                {[
                  {
                    key: "all" as TabType,
                    label: "All",
                    count: notifications.length,
                  },
                  {
                    key: "orders" as TabType,
                    label: "Orders",
                    count: orderCount,
                  },
                  {
                    key: "alerts" as TabType,
                    label: "Alerts",
                    count: alertCount,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1 ${
                      activeTab === tab.key
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="text-[10px] text-gray-400">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Mark All Read Button */}
              {notifications.length > 0 && (
                <div className="flex items-center justify-end gap-3 -mb-1">
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0 || isMarkingAll}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed hover:underline"
                  >
                    <CheckCheck size={13} />
                    Mark all read
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5" ref={listRef}>
          {hookLoading && notifications.length === 0 ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/50 bg-gray-50 dark:bg-gray-800/20 flex gap-3 animate-pulse"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedNotifications.length > 0 ? (
            <>
              {displayedNotifications.map((n) => {
                const kind = getKind(n);
                const unread = isUnread(n);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 items-start ${
                      unread
                        ? "bg-blue-50/60 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-800"
                        : "bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                    } hover:shadow-md`}
                  >
                    {unread && (
                      <span className="absolute top-3.5 left-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}

                    <div className="relative shrink-0 mt-0.5 ml-1">
                      {n.image ? (
                        <img
                          src={n.image}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        />
                      ) : kind === "alert" ? (
                        <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/50 dark:border-amber-900/50">
                          <AlertTriangle size={18} />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/50 dark:border-blue-900/50">
                          <ShoppingBag size={18} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4
                          className={`text-sm truncate ${
                            unread
                              ? "font-bold text-gray-900 dark:text-gray-100"
                              : "font-semibold text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {n.first_name
                            ? `${n.first_name} ${n.last_name || ""}`
                            : n.title || "Order Update"}
                        </h4>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1">
                        <span className="text-[11px] text-gray-400 font-medium">
                          {n.time || n.time_ago || n.created_at_human}
                        </span>

                        {n.total && (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            ${n.total}
                          </span>
                        )}

                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                          View <ExternalLink size={12} />
                        </span>
                      </div>
                    </div>

                    <div className="absolute top-3 right-3">
                      <button
                        aria-label="More options"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === n.id ? null : n.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {activeMenuId === n.id && (
                        <div className="absolute right-0 top-6 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-10 py-1">
                          <button
                            onClick={(e) => handleDelete(e, n.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {!showAll && filteredNotifications.length > 5 && (
                <button
                  onClick={() => setShowAll(true)}
                  className="w-full py-2.5 mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 rounded-xl transition-colors"
                >
                  View More ({filteredNotifications.length - 5})
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 space-y-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50">
                {searchQuery ? <Search size={24} /> : <Sparkles size={24} />}
              </div>
              <p className="text-xs font-medium">
                {searchQuery
                  ? "No matching notifications"
                  : "You're all caught up"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;
