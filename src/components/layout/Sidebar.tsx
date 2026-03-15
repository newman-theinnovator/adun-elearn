"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, BookOpen, BarChart3, MessageSquare,
    User as UserIcon, ClipboardList, Award, GraduationCap,
    Settings, Users
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

    const navItems = userRole === "ADMIN" ? adminNav : userRole === "LECTURER" ? lecturerNav : studentNav;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isOpen ? "translate-x-0" : "-translate-x-full"} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
                {/* Logo */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">ADUN E-Learn</h1>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Admiralty University</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
                    {navItems.map((item, index) => {
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 animate-fade-in-up hover:scale-[1.02] ${isActive
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm hover:text-blue-600 dark:hover:text-white"
                                    }`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "" : "text-gray-400"}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
