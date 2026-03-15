"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useLogActivity } from "@/hooks/useActivity";

interface DashboardLayoutClientProps {
    children: React.ReactNode;
    user: {
        id: string;
        role: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { mutate: logActivity } = useLogActivity();
    const hasLoggedLogin = useRef(false);

    // Log LOGIN activity once per session mount
    useEffect(() => {
        if (!hasLoggedLogin.current) {
            logActivity({ action: "LOGIN" });
            hasLoggedLogin.current = true;
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return (
        <div className="min-h-screen flex overflow-x-hidden bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
            <Sidebar
                userRole={user.role}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />

            <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-transparent to-blue-50/30 dark:to-blue-900/10 relative">
                {/* Background Decorative Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

                <Header
                    user={user}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
