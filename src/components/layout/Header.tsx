"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Bell, Menu, X, Sun, Moon, ChevronDown, User as UserIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/hooks/useFeatures";

interface NotificationItem {
    id: string;
    title?: string;
    message?: string;
    isRead: boolean;
    createdAt: string;
}

interface HeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string;
        firstName?: string;
        lastName?: string;
    };
    sidebarOpen: boolean;
    setSidebarOpen: (isOpen: boolean) => void;
}

export function Header({ user, sidebarOpen, setSidebarOpen }: HeaderProps) {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close either dropdown when the user clicks anywhere outside of it —
    // previously they only closed via their own toggle button.
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Generate title from pathname. Dynamic route segments (course/thread/user
    // ids) are database identifiers, not words — fall back to a label based on
    // the parent segment instead of rendering the raw id.
    const pathSegments = pathname.split("/").filter(Boolean);
    const currentSegment = pathSegments[pathSegments.length - 1] || "dashboard";
    const parentSegment = pathSegments[pathSegments.length - 2];
    const isRawIdSegment = /^[a-z0-9]{20,}$/i.test(currentSegment);
    const dynamicSegmentLabels: Record<string, string> = {
        courses: "Course Details",
        forum: "Discussion Thread",
        users: "User Details",
        assessments: "Assessment Details",
    };
    const title =
        currentSegment === "dashboard"
            ? `${user.role?.toLowerCase()} Dashboard`
            : isRawIdSegment
              ? dynamicSegmentLabels[parentSegment] || "Details"
              : currentSegment.replace(/-/g, " ");

    const roleColors: Record<string, string> = {
        STUDENT: "bg-emerald-500",
        LECTURER: "bg-blue-500",
        ADMIN: "bg-purple-500",
    };

    const userRoleColor = roleColors[user.role || "STUDENT"] || "bg-gray-500";
    const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}` || "U";

    // Mock notifications for UI matching the prototype
    const { data: notifications } = useNotifications();
    const notificationList = (notifications || []) as NotificationItem[];
    const unreadCount = notificationList.filter((n) => !n.isRead).length;

    return (
        <header className="glass sticky top-0 z-30 border-b border-gray-200 px-4 py-3 text-gray-900 transition-all duration-300 lg:px-8 lg:py-4 dark:border-gray-800 dark:text-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                        className="rounded-xl p-2 transition-colors hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
                    >
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                    <div>
                        <h2 className="from-navy-800 to-crimson-600 dark:from-navy-300 dark:to-crimson-400 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent capitalize">
                            {title}
                        </h2>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {new Date().toLocaleDateString("en-NG", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        aria-label={
                            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
                        }
                        className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {theme === "dark" ? (
                            <Sun className="h-5 w-5 text-yellow-400" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notificationsRef}>
                        <button
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                setShowUserMenu(false);
                            }}
                            aria-label={
                                unreadCount > 0
                                    ? `Notifications (${unreadCount} unread)`
                                    : "Notifications"
                            }
                            className="relative rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                                    <h3 className="text-sm font-semibold dark:text-white">
                                        Notifications
                                    </h3>
                                    {unreadCount > 0 && (
                                        <span className="text-crimson-600 text-xs font-medium">
                                            {unreadCount} unread
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notificationList.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-gray-400">
                                            You&apos;re all caught up! 🎉
                                        </div>
                                    ) : (
                                        // The list arrives oldest-first; take the most recent
                                        // few while preserving that chronological order.
                                        notificationList.slice(-6).map((n) => (
                                            <div
                                                key={n.id}
                                                className={`border-b border-gray-50 px-4 py-3 text-sm dark:border-gray-700 ${!n.isRead ? "bg-navy-50 dark:bg-navy-900/20" : ""}`}
                                            >
                                                <p className="line-clamp-1 font-medium dark:text-white">
                                                    {n.title || n.message}
                                                </p>
                                                <p className="mt-0.5 text-xs text-gray-400">
                                                    {new Date(n.createdAt).toLocaleDateString(
                                                        "en-NG"
                                                    )}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => {
                                setShowUserMenu(!showUserMenu);
                                setShowNotifications(false);
                            }}
                            aria-label="Open user menu"
                            className="flex items-center gap-3 rounded-full border border-gray-100 bg-white p-1.5 pr-3 transition-all duration-300 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                        >
                            <div
                                className={`h-9 w-9 rounded-full ${userRoleColor} flex items-center justify-center text-sm font-bold text-white shadow-inner`}
                            >
                                {initials}
                            </div>
                            <div className="hidden text-left sm:block">
                                <p className="text-sm leading-tight font-semibold">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-crimson-600 dark:text-crimson-400 text-[10px] font-medium tracking-wider uppercase">
                                    {user.role}
                                </p>
                            </div>
                            <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block" />
                        </button>

                        {showUserMenu && (
                            <div className="glass animate-scale-in absolute right-0 z-50 mt-3 w-64 origin-top-right overflow-hidden rounded-2xl border shadow-2xl">
                                <div className="border-b border-gray-100 bg-white/50 px-5 py-4 dark:border-gray-700/50 dark:bg-gray-800/50">
                                    <p className="text-base font-bold">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                        {user.email}
                                    </p>
                                    <span
                                        className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase ${userRoleColor}`}
                                    >
                                        {user.role}
                                    </span>
                                </div>
                                <div className="p-2">
                                    <Link
                                        href="/dashboard/profile"
                                        onClick={() => setShowUserMenu(false)}
                                        className="hover:bg-navy-50 hover:text-navy-700 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors dark:hover:bg-gray-700/80"
                                    >
                                        <UserIcon className="h-4 w-4" /> My Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            signOut({ callbackUrl: "/login" });
                                        }}
                                        className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <LogOut className="h-4 w-4" /> Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
