"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useCourses } from "@/hooks/useCourses";
import { useAssessments } from "@/hooks/useAssessments";
import { useStudentAnalytics } from "@/hooks/useAnalytics";
import {
    BookOpen,
    ClipboardList,
    TrendingUp,
    Trophy,
    ArrowRight,
    AlertTriangle,
    CheckCircle2,
    Target,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealtime } from "@/hooks/useRealtime";
import { useState, useEffect } from "react";

export function StudentDashboard() {
    const { data: session } = useAuth();
    const user = session?.user as any;

    useCourses();
    useAssessments();
    const { data: analytics, isLoading: analyticsLoading } = useStudentAnalytics(user?.id);
    const { onlineUsers, lastUpdated } = useRealtime(user?.id);

    const [aiInsights, setAiInsights] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetch(`/api/ai-insights/${user.id}`)
                .then((res) => res.json())
                .then((data) => {
                    setAiInsights(data);
                    setAiLoading(false);
                })
                .catch((err) => {
                    console.error("Failed to fetch AI insights", err);
                    setAiLoading(false);
                });
        }
    }, [user?.id]);

    if (!user || analyticsLoading) {
        return (
            <div className="mx-auto max-w-7xl space-y-6">
                <Skeleton className="h-48 w-full rounded-3xl" />
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    const enrolledCount = analytics?.enrolledCoursesCount || 0;
    const pendingCount = analytics?.pendingTasksCount || 0;
    const currentGPA = analytics?.cgpa || 0;

    const statCards = [
        {
            label: "Enrolled Courses",
            value: enrolledCount,
            icon: BookOpen,
            bgColor: "bg-blue-50 dark:bg-blue-900/30",
            textColor: "text-blue-700 dark:text-blue-400",
        },
        {
            label: "Current CGPA",
            value: currentGPA,
            icon: Trophy,
            bgColor: "bg-amber-50 dark:bg-amber-900/30",
            textColor: "text-amber-700 dark:text-amber-400",
        },
        {
            label: "Logins",
            value: analytics?.engagement?.loginCount || 0,
            icon: Target,
            bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
            textColor: "text-emerald-700 dark:text-emerald-400",
        },
        {
            label: "Pending Tasks",
            value: pendingCount,
            icon: ClipboardList,
            bgColor: "bg-purple-50 dark:bg-purple-900/30",
            textColor: "text-purple-700 dark:text-purple-400",
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
                <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    Live &bull; {onlineUsers} {onlineUsers === 1 ? "user" : "users"} online
                </div>
            </div>

            {/* Welcome Banner */}
            <div className="from-navy-950 via-navy-900 to-navy-800 shadow-navy-900/20 relative isolate overflow-hidden rounded-2xl bg-gradient-to-r p-5 text-white shadow-2xl sm:rounded-3xl sm:p-8">
                <div className="animate-float absolute -top-20 -right-20 h-80 w-80 rounded-full bg-gradient-to-br from-amber-400/30 to-rose-400/30 blur-3xl" />
                <div
                    className="animate-float absolute -bottom-20 left-10 h-60 w-60 rounded-full bg-gradient-to-tr from-cyan-400/30 to-blue-400/30 blur-3xl"
                    style={{ animationDelay: "2s" }}
                />

                <div className="animate-fade-in-up relative z-10">
                    <h1 className="text-xl font-extrabold tracking-tight sm:text-3xl">
                        Welcome back, {user.firstName}! 👋
                    </h1>
                    <p className="mt-1 text-xs font-medium text-indigo-200 sm:mt-2 sm:text-base">
                        {user.matricNumber || "N/A"} •{" "}
                        <span className="rounded-md bg-white/10 px-2 py-0.5 text-white">
                            {user.level || 400} Level
                        </span>{" "}
                        • Dept. of Computer Science
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 sm:mt-8 sm:gap-4">
                        <div className="glass min-w-0 flex-1 rounded-xl px-3 py-3 sm:flex-none sm:rounded-2xl sm:px-5 sm:py-4">
                            <p className="mb-1 text-[10px] font-semibold tracking-wider text-indigo-200 uppercase sm:text-xs">
                                Predicted Grade
                            </p>
                            {aiLoading ? (
                                <Skeleton className="mt-1 h-8 w-16 bg-white/20" />
                            ) : (
                                <p className="from-crimson-300 to-crimson-500 bg-gradient-to-r bg-clip-text text-xl font-black text-transparent sm:text-3xl">
                                    {aiInsights?.predictedGrade || 0}%
                                </p>
                            )}
                        </div>
                        <div className="glass min-w-0 flex-1 rounded-xl px-3 py-3 sm:flex-none sm:rounded-2xl sm:px-5 sm:py-4">
                            <p className="mb-1 text-[10px] font-semibold tracking-wider text-indigo-200 uppercase sm:text-xs">
                                Confidence
                            </p>
                            {aiLoading ? (
                                <Skeleton className="mt-1 h-8 w-16 bg-white/20" />
                            ) : (
                                <p className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-xl font-black text-transparent sm:text-3xl">
                                    {aiInsights?.confidence || 0}%
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
                {statCards.map((stat, i) => (
                    <div
                        key={i}
                        className={`glass-card group animate-fade-in-up rounded-xl p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-2xl sm:p-5 delay-${(i % 4) * 100 + 100}`}
                    >
                        <div className="flex items-center justify-between">
                            <div
                                className={`h-9 w-9 sm:h-12 sm:w-12 ${stat.bgColor} flex items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 sm:rounded-2xl`}
                            >
                                <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.textColor}`} />
                            </div>
                            <TrendingUp className="h-4 w-4 text-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:h-5 sm:w-5" />
                        </div>
                        <p className="mt-2 text-xl font-black sm:mt-4 sm:text-3xl dark:text-white">
                            {stat.value}
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-gray-500 uppercase sm:mt-1 sm:text-sm dark:text-gray-400">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
                {/* GPA Trend Chart */}
                <div className="glass-card rounded-2xl p-4 transition-shadow hover:shadow-lg sm:p-6 md:col-span-2">
                    <div className="mb-4 flex items-center justify-between sm:mb-6">
                        <h3 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-base font-bold text-transparent sm:text-lg dark:from-white dark:to-gray-300">
                            GPA Trend
                        </h3>
                        <Link
                            href="/dashboard/analytics"
                            className="group flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 sm:text-sm dark:text-blue-400"
                        >
                            Analytics{" "}
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <div className="h-48 sm:h-64">
                        {analytics?.gpaTrend && analytics.gpaTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics.gpaTrend}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e2e8f0"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="semester"
                                        tick={{ fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        domain={[0, 5]}
                                        tick={{ fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: "12px", border: "none" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="gpa"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ fill: "#8b5cf6", r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                No GPA data available yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Recommendations */}
                <div className="glass-card flex flex-col rounded-2xl p-4 transition-shadow hover:shadow-lg sm:p-6">
                    <h3 className="mb-4 flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-base font-bold text-transparent sm:mb-6 sm:text-lg dark:from-white dark:to-gray-300">
                        <span className="animate-pulse text-xl sm:text-2xl">🤖</span> AI Insights
                    </h3>
                    {aiLoading ? (
                        <div className="flex-1 space-y-3">
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                    ) : (
                        <div className="flex-1 space-y-3 sm:space-y-4">
                            <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-3 text-sm transition-all hover:shadow-sm dark:border-blue-900/30 dark:bg-blue-900/10">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                                    <p className="font-medium text-gray-700 dark:text-gray-300">
                                        Strongest area:{" "}
                                        <span className="font-bold text-gray-900 dark:text-gray-100">
                                            {aiInsights?.strongestArea || "N/A"}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-rose-100 bg-rose-50/80 p-3 text-sm transition-all hover:shadow-sm dark:border-rose-900/30 dark:bg-rose-900/10">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                                    <p className="font-medium text-gray-700 dark:text-gray-300">
                                        Area to improve:{" "}
                                        <span className="font-bold text-gray-900 dark:text-gray-100">
                                            {aiInsights?.areaToImprove || "N/A"}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm transition-all hover:shadow-sm dark:border-emerald-900/30 dark:bg-emerald-900/10">
                                <div className="flex items-start gap-2">
                                    <Target className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                    <p className="font-medium text-gray-700 dark:text-gray-300">
                                        <span className="font-bold text-gray-900 dark:text-gray-100">
                                            Analysis:
                                        </span>{" "}
                                        {aiInsights?.explanation ||
                                            "Keep learning to get detailed insights."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
