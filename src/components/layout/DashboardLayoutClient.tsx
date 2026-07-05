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
        <div className="flex min-h-screen overflow-x-hidden bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-white">
            <Sidebar userRole={user.role} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="to-navy-50/30 dark:to-navy-900/10 relative flex min-w-0 flex-1 flex-col bg-gradient-to-br from-transparent">
                {/* Background Decorative Blobs */}
                <div className="bg-navy-400/10 dark:bg-navy-500/5 pointer-events-none absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full blur-3xl" />
                <div className="bg-crimson-400/10 dark:bg-crimson-500/5 pointer-events-none absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full blur-3xl" />

                <Header user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}
