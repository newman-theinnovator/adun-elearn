"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Bell, Menu, X, Sun, Moon, ChevronDown, User as UserIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useFeatures";

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

    // Generate title from pathname
    const pathSegments = pathname.split("/").filter(Boolean);
    const currentSegment = pathSegments[pathSegments.length - 1] || "dashboard";
    const title = currentSegment === "dashboard" ? `${user.role?.toLowerCase()} Dashboard` : currentSegment.replace(/-/g, " ");

    const roleColors: Record<string, string> = {
        STUDENT: "bg-emerald-500",
        LECTURER: "bg-blue-500",
        ADMIN: "bg-purple-500",
    };

    const userRoleColor = roleColors[user.role || "STUDENT"] || "bg-gray-500";
    const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}` || "U";

    // Mock notifications for UI matching the prototype
    const { data: notifications } = useNotifications();
    const unreadCount = (notifications || []).filter((n: any) => !n.isRead).length;

    return (
        <header className="sticky top-0 z-30 glass border-b border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white px-4 py-3 lg:px-8 lg:py-4 transition-all duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <div>
                        <h2 className="text-xl font-bold capitalize bg-gradient-to-r from-blue-900 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                            {title}
                        </h2>
                        <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">
                            {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                            className="relative p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <h3 className="font-semibold text-sm dark:text-white">Notifications</h3>
                                    {unreadCount > 0 && <span className="text-xs text-blue-600 font-medium">{unreadCount} unread</span>}
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {!notifications || notifications.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-gray-400">You're all caught up! 🎉</div>
                                    ) : (
                                        (notifications as any[]).slice(0, 6).map((n: any) => (
                                            <div key={n.id} className={`px-4 py-3 border-b border-gray-50 dark:border-gray-700 text-sm ${!n.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}>
                                                <p className="font-medium dark:text-white line-clamp-1">{n.title || n.message}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString("en-NG")}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                            className="flex items-center gap-3 p-1.5 pr-3 rounded-full transition-all duration-300 hover:shadow-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700"
                        >
                            <div className={`w-9 h-9 rounded-full ${userRoleColor} shadow-inner flex items-center justify-center text-white font-bold text-sm`}>
                                {initials}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-semibold leading-tight">{user.firstName} {user.lastName}</p>
                                <p className="text-[10px] uppercase tracking-wider font-medium text-blue-600 dark:text-blue-400">{user.role}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl glass border overflow-hidden animate-scale-in origin-top-right z-50">
                                <div className="px-5 py-4 border-b border-gray-100 bg-white/50 dark:border-gray-700/50 dark:bg-gray-800/50">
                                    <p className="font-bold text-base">{user.firstName} {user.lastName}</p>
                                    <p className="text-xs mt-0.5 text-gray-500 dark:text-gray-400">{user.email}</p>
                                    <span className={`inline-block mt-2 text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide text-white uppercase ${userRoleColor}`}>
                                        {user.role}
                                    </span>
                                </div>
                                <div className="p-2">
                                    <Link
                                        href="/dashboard/profile"
                                        onClick={() => setShowUserMenu(false)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl font-medium transition-colors hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-700/80"
                                    >
                                        <UserIcon className="w-4 h-4" /> My Profile
                                    </Link>
                                    <button
                                        onClick={() => { signOut({ callbackUrl: "/login" }); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-1"
                                    >
                                        <LogOut className="w-4 h-4" /> Sign Out
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
