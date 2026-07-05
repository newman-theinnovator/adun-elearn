"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useCourses } from "@/hooks/useCourses";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Users, ClipboardList, AlertTriangle, ArrowRight, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealtime } from "@/hooks/useRealtime";

function useLecturerStats() {
    return useQuery<{
        pendingGrading: number;
        passRate: number;
        totalGraded: number;
        totalCourses: number;
        totalStudents: number;
        courseAverages: { code: string; title: string; average: number }[];
    }>({
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
    const { onlineUsers, lastUpdated } = useRealtime(user?.id);

    if (!user || coursesLoading) {
        return (
            <div className="mx-auto max-w-7xl space-y-6">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    const myCourses = courses || [];
    const totalStudents = lecturerStats?.totalStudents ?? 0;
    const pendingGrading = lecturerStats?.pendingGrading ?? 0;
    const passRate = lecturerStats?.passRate ?? 0;
    const totalCourses = lecturerStats?.totalCourses ?? 0;

    const stats = [
        {
            label: "My Courses",
            value: totalCourses,
            icon: BookOpen,
            bg: "bg-blue-50 dark:bg-blue-900/30",
            color: "text-blue-600 dark:text-blue-400",
        },
        {
            label: "Total Students",
            value: totalStudents,
            icon: Users,
            bg: "bg-emerald-50 dark:bg-emerald-900/30",
            color: "text-emerald-600 dark:text-emerald-400",
        },
        {
            label: "Pending Grading",
            value: pendingGrading,
            icon: ClipboardList,
            bg: "bg-amber-50 dark:bg-amber-900/30",
            color: "text-amber-600 dark:text-amber-400",
        },
        {
            label: "Class Pass Rate",
            value: `${passRate}%`,
            icon: Award,
            bg: "bg-purple-50 dark:bg-purple-900/30",
            color: "text-purple-600 dark:text-purple-400",
        },
    ];

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Dashboard Header with Live Badge */}
            <div className="mb-2 flex items-center justify-end gap-3">
                <span className="text-[10px] font-medium text-gray-400 sm:text-xs dark:text-gray-500">
                    Last updated:{" "}
                    {lastUpdated.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    })}
                </span>
                <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 shadow-sm dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    Live &bull; {onlineUsers} {onlineUsers === 1 ? "user" : "users"} online
                </div>
            </div>

            {/* Welcome */}
            <div className="from-navy-800 to-navy-700 rounded-2xl bg-gradient-to-r p-5 text-white shadow-xl sm:p-6">
                <h1 className="text-xl font-bold sm:text-2xl">
                    {user.firstName} {user.lastName}
                </h1>
                <p className="mt-1 text-xs text-blue-200 sm:text-sm">
                    {user.staffId || "Staff"} • Department of Computer Science
                </p>
                <p className="mt-2 text-xs text-blue-300">
                    {pendingGrading} submissions awaiting grading
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {stats.map((s, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-transform hover:-translate-y-1 sm:p-4 dark:border-gray-700 dark:bg-gray-800"
                    >
                        <div
                            className={`h-9 w-9 sm:h-10 sm:w-10 ${s.bg} mb-2 flex items-center justify-center rounded-xl sm:mb-3`}
                        >
                            <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color}`} />
                        </div>
                        <p className="text-xl font-bold sm:text-2xl dark:text-white">{s.value}</p>
                        <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase sm:text-xs dark:text-gray-400">
                            {s.label}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                {/* At-Risk Students (Placeholder) */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-1 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-4 flex items-center gap-2 font-semibold dark:text-white">
                        <AlertTriangle className="h-4 w-4 text-red-500" /> At-Risk Alerts
                    </h3>
                    <div className="space-y-3">
                        <div className="rounded-lg border border-red-100 bg-red-50/50 p-3 dark:border-red-900/30 dark:bg-red-900/10">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Select a course to view detailed student performance metrics and
                                at-risk alerts.
                            </p>
                        </div>
                    </div>
                </div>

                {/* My Courses */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2 dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold dark:text-white">Active Courses</h3>
                        <Link
                            href="/dashboard/courses"
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400"
                        >
                            Manage Courses <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {myCourses.length === 0 ? (
                            <p className="col-span-2 py-4 text-center text-sm text-gray-500">
                                You are not assigned to any courses.
                            </p>
                        ) : (
                            myCourses.map((c: any) => (
                                <Link key={c.id} href={`/dashboard/courses/${c.id}`}>
                                    <div className="block h-full cursor-pointer rounded-xl border border-gray-100 p-4 transition-all hover:border-blue-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500/50">
                                        <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                            {c.code}
                                        </span>
                                        <h4 className="mt-2 line-clamp-2 text-sm font-semibold dark:text-white">
                                            {c.title}
                                        </h4>
                                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <Users className="h-3 w-3" />
                                            <span>
                                                {c._count?.enrollments || 0} students enrolled
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Average Grade per Course Chart */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-sm font-semibold sm:text-base dark:text-white">
                    Average Grade per Course
                </h3>
                <div className="h-48 sm:h-56">
                    {lecturerStats?.courseAverages && lecturerStats.courseAverages.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={lecturerStats.courseAverages}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                    vertical={false}
                                />
                                <XAxis dataKey="code" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                                <Tooltip contentStyle={{ borderRadius: "8px" }} />
                                <Bar dataKey="average" fill="#10B981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                            No graded assessments available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
