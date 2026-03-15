"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useCourses } from "@/hooks/useCourses";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Users, ClipboardList, AlertTriangle, ArrowRight, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

function useLecturerStats() {
    return useQuery<{ pendingGrading: number; passRate: number; totalGraded: number }>({
        queryKey: ["analytics", "lecturer"],
        queryFn: async () => {
            const res = await fetch("/api/analytics/lecturer");
            if (!res.ok) throw new Error("Failed to fetch lecturer stats");
            return res.json();
        },
    });
}

export function LecturerDashboard() {
    const { data: session } = useAuth();
    const user = session?.user as any;

    const { data: courses, isLoading: coursesLoading } = useCourses();
    const { data: lecturerStats } = useLecturerStats();

    if (!user || coursesLoading) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    const myCourses = courses || [];
    const totalStudents = myCourses.reduce((acc, curr) => acc + (curr._count?.enrollments || 0), 0);
    const pendingGrading = lecturerStats?.pendingGrading ?? 0;
    const passRate = lecturerStats?.passRate ?? 0;

    const stats = [
        { label: "My Courses", value: myCourses.length, icon: BookOpen, bg: "bg-blue-50 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" },
        { label: "Total Students", value: totalStudents, icon: Users, bg: "bg-emerald-50 dark:bg-emerald-900/30", color: "text-emerald-600 dark:text-emerald-400" },
        { label: "Pending Grading", value: pendingGrading, icon: ClipboardList, bg: "bg-amber-50 dark:bg-amber-900/30", color: "text-amber-600 dark:text-amber-400" },
        { label: "Class Pass Rate", value: `${passRate}%`, icon: Award, bg: "bg-purple-50 dark:bg-purple-900/30", color: "text-purple-600 dark:text-purple-400" },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-blue-800 to-indigo-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl">
                <h1 className="text-xl sm:text-2xl font-bold">{user.firstName} {user.lastName}</h1>
                <p className="text-blue-200 text-xs sm:text-sm mt-1">{user.staffId || "Staff"} • Department of Computer Science</p>
                <p className="text-blue-300 text-xs mt-2">{pendingGrading} submissions awaiting grading</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-gray-700 shadow-sm transition-transform hover:-translate-y-1">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 ${s.bg} rounded-xl flex items-center justify-center mb-2 sm:mb-3`}>
                            <s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color}`} />
                        </div>
                        <p className="text-xl sm:text-2xl font-bold dark:text-white">{s.value}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                {/* At-Risk Students (Placeholder) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 lg:col-span-1">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 dark:text-white">
                        <AlertTriangle className="w-4 h-4 text-red-500" /> At-Risk Alerts
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                            <p className="text-sm text-gray-600 dark:text-gray-300">Select a course to view detailed student performance metrics and at-risk alerts.</p>
                        </div>
                    </div>
                </div>

                {/* My Courses */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold dark:text-white">Active Courses</h3>
                        <Link href="/dashboard/courses" className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:text-blue-800 transition-colors">
                            Manage Courses <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {myCourses.length === 0 ? (
                            <p className="text-sm text-gray-500 col-span-2 text-center py-4">You are not assigned to any courses.</p>
                        ) : (
                            myCourses.map((c: any) => (
                                <Link key={c.id} href={`/dashboard/courses/${c.id}`}>
                                    <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer dark:bg-gray-800/50 block h-full">
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{c.code}</span>
                                        <h4 className="font-semibold text-sm mt-2 line-clamp-2 dark:text-white">{c.title}</h4>
                                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                                            <Users className="w-3 h-3" />
                                            <span>{c._count?.enrollments || 0} students enrolled</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
