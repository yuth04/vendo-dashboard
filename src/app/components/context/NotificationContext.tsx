"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext({
    unreadCount: 0,
    incrementCount: () => {},
    resetCount: () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    // FIX: Use lazy initialization to read from localStorage immediately
    const [unreadCount, setUnreadCount] = useState<number>(() => {
        if (typeof window !== "undefined") {
            const savedCount = localStorage.getItem("unreadCount");
            return savedCount ? parseInt(savedCount, 10) : 0;
        }
        return 0;
    });

    // We keep this useEffect to sync across tabs if needed,
    // though the state is now initialized correctly
    useEffect(() => {
        const handleStorageChange = () => {
            const savedCount = localStorage.getItem("unreadCount");
            setUnreadCount(savedCount ? parseInt(savedCount, 10) : 0);
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const incrementCount = () => {
        setUnreadCount((prev) => {
            const nextCount = prev + 1;
            localStorage.setItem("unreadCount", nextCount.toString());
            return nextCount;
        });
    };

    const resetCount = () => {
        setUnreadCount(0);
        localStorage.removeItem("unreadCount");
    };

    return (
        <NotificationContext.Provider value={{ unreadCount, incrementCount, resetCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);