"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    BarChart3,
    MessageSquare,
    ClipboardList,
    Award,
    GraduationCap,
    Settings,
    Users,
} from "lucide-react";

interface SidebarProps {
    userRole: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ userRole, isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();

    const studentNav = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
        { href: "/dashboard/assessments", label: "Assessments", icon: ClipboardList },
        { href: "/dashboard/gradebook", label: "Gradebook", icon: Award },
        { href: "/dashboard/analytics", label: "My Analytics", icon: BarChart3 },
        { href: "/dashboard/forum", label: "Discussion Forum", icon: MessageSquare },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ];

    const lecturerNav = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
        { href: "/dashboard/assessments", label: "Assessments", icon: ClipboardList },
        { href: "/dashboard/analytics", label: "Class Analytics", icon: BarChart3 },
        { href: "/dashboard/forum", label: "Discussion Forum", icon: MessageSquare },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ];

    const adminNav = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/users", label: "User Management", icon: Users },
        { href: "/dashboard/courses", label: "All Courses", icon: BookOpen },
        { href: "/dashboard/analytics", label: "Department Analytics", icon: BarChart3 },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ];

    const navItems =
        userRole === "ADMIN" ? adminNav : userRole === "LECTURER" ? lecturerNav : studentNav;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800`}
            >
                {/* Logo */}
                <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3"
                        onClick={() => setIsOpen(false)}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 to-blue-700">
                            <GraduationCap className="h-6 w-6 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-lg leading-tight font-bold text-transparent">
                                ADUN E-Learn
                            </h1>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                Admiralty University
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2 overflow-y-auto p-3">
                    {navItems.map((item, index) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`group animate-fade-in-up flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 hover:scale-[1.02] ${
                                    isActive
                                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                                        : "text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                                }`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <item.icon
                                    className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? "" : "text-gray-400"}`}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
