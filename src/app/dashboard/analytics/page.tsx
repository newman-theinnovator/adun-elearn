"use client";

import { useAuth } from "@/providers/AuthProvider";
import {
    useStudentAnalytics,
    useCourseAnalytics,
    useDepartmentAnalytics,
} from "@/hooks/useAnalytics";
import { TrendingUp, Brain, Activity, Download } from "lucide-react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    AreaChart,
    Area,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function AnalyticsPage() {
    const { data: session } = useAuth();
    const user = session?.user as any;
    const role = user?.role || "STUDENT";

    const { data: studentData, isLoading: studentLoading } = useStudentAnalytics(user?.id);
    const { data: adminData, isLoading: adminLoading } = useDepartmentAnalytics();

    // NOTE: A lecturer analytics page would typically first fetch active courses or select a specific course
    // We'll mimic the prototype's class general analytics view using department analytics if course is omitted, or a placeholder loading.
    useCourseAnalytics("placeholder-course");

    if (!user || studentLoading || adminLoading) {
        return (
            <div className="mx-auto max-w-7xl space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-40 w-full rounded-2xl" />
                <div className="grid gap-6 lg:grid-cols-2">
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------------------
    // STUDENT VIEW
    // ------------------------------------------------------------------------
    if (role === "STUDENT") {
        if (!studentData) return <div>No data found.</div>;
        return (
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">
                            My Performance Analytics
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Track your academic progress and get personalized insights
                        </p>
                    </div>
                    <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg">
                        <Download className="h-4 w-4" /> Export Report
                    </button>
                </div>

                {/* Prediction Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-blue-900 to-purple-800 p-6 text-white shadow-xl md:p-8">
                    <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                    <div className="relative z-10">
                        <div className="mb-4 flex items-center gap-2">
                            <Brain className="h-6 w-6 text-emerald-300" />
                            <h3 className="text-lg font-bold text-emerald-50">
                                AI Grade Prediction Engine
                            </h3>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3 lg:gap-6">
                            <div className="rounded-xl border border-white/20 bg-white/10 p-5 shadow-inner backdrop-blur-md">
                                <p className="text-xs font-semibold tracking-wider text-blue-200 uppercase">
                                    Current CGPA
                                </p>
                                <p className="mt-2 text-4xl font-black tracking-tight">
                                    {studentData.cgpa}
                                </p>
                                <p className="mt-2 text-[10px] text-blue-300">
                                    Based on {studentData.gpaTrend?.length || 0} semesters
                                </p>
                            </div>
                            <div className="rounded-xl border border-amber-300/30 bg-white/10 p-5 shadow-inner backdrop-blur-md">
                                <p className="text-xs font-semibold tracking-wider text-amber-200 uppercase">
                                    Predicted Final Grade
                                </p>
                                <p className="mt-2 text-4xl font-black tracking-tight text-amber-400">
                                    {studentData.predictions?.predictedScore || "N/A"}%
                                </p>
                                <p className="mt-2 text-[10px] text-amber-200/70">
                                    Using multi-factor trend analysis
                                </p>
                            </div>
                            <div className="rounded-xl border border-emerald-300/30 bg-white/10 p-5 shadow-inner backdrop-blur-md">
                                <p className="text-xs font-semibold tracking-wider text-emerald-200 uppercase">
                                    Model Confidence
                                </p>
                                <p className="mt-2 text-4xl font-black tracking-tight text-emerald-400">
                                    {studentData.predictions?.confidence || 0}%
                                </p>
                                <p className="mt-2 text-[10px] text-emerald-200/70">
                                    Based on historical data completeness
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* GPA Trend */}
                    <Card className="rounded-xl p-5 transition-shadow hover:shadow-md">
                        <h3 className="mb-6 flex items-center gap-2 font-bold dark:text-white">
                            <TrendingUp className="h-5 w-5 text-blue-500" /> GPA Progression
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={studentData.gpaTrend || []}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        strokeOpacity={0.1}
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
                                        tick={{ fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "none",
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="gpa"
                                        stroke="#3B82F6"
                                        fill="url(#colorGpa)"
                                        strokeWidth={3}
                                    />
                                    <defs>
                                        <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor="#3B82F6"
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#3B82F6"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Engagement */}
                    <Card className="rounded-xl p-5 transition-shadow hover:shadow-md">
                        <h3 className="mb-6 flex items-center gap-2 font-bold dark:text-white">
                            <Activity className="h-5 w-5 text-emerald-500" /> Active Engagement
                        </h3>
                        <div className="grid h-full grid-cols-2 gap-4 pb-8">
                            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
                                <p className="mb-2 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                    Total Logins
                                </p>
                                <p className="text-4xl font-black text-blue-600 dark:text-blue-400">
                                    {studentData.engagement?.loginCount || 0}
                                </p>
                            </div>
                            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
                                <p className="mb-2 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                    Time Spent
                                </p>
                                <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                                    {Math.round(
                                        (studentData.engagement?.totalTimeSpentMinutes || 0) / 60
                                    )}
                                    h
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* AI Recommendations */}
                <Card className="relative overflow-hidden rounded-xl p-6">
                    <div className="absolute top-0 right-0 -z-0 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
                    <h3 className="relative z-10 mb-6 flex items-center gap-2 text-lg font-bold dark:text-white">
                        <span className="text-2xl">💡</span> Key Insights
                    </h3>
                    <div className="relative z-10 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 transition-all hover:shadow-sm dark:border-emerald-900/30 dark:bg-emerald-900/10">
                            <h4 className="mb-2 font-bold text-emerald-800 dark:text-emerald-400">
                                Great Work
                            </h4>
                            <p className="text-sm leading-relaxed font-medium text-emerald-700 dark:text-emerald-300">
                                {studentData.strengths}
                            </p>
                        </div>
                        <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 transition-all hover:shadow-sm dark:border-amber-900/30 dark:bg-amber-900/10">
                            <h4 className="mb-2 font-bold text-amber-800 dark:text-amber-400">
                                Focus Areas
                            </h4>
                            <p className="text-sm leading-relaxed font-medium text-amber-700 dark:text-amber-300">
                                {studentData.weaknesses}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // ------------------------------------------------------------------------
    // LECTURER / ADMIN VIEW (Consolidated for brevity using Department Analytics as Admin is fully developed)
    // ------------------------------------------------------------------------
    if (!adminData) return null;

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">
                        {role === "ADMIN" ? "Department Analytics" : "Advanced Analytics"}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        High-level overview of system and student performance.
                    </p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg">
                    <Download className="h-4 w-4" /> Export Report Data
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: "Total Enrollments", value: adminData.overview.activeEnrollments },
                    { label: "Active Courses", value: adminData.overview.totalCourses },
                    { label: "Avg Department GPA", value: adminData.overview.departmentAverageGPA },
                    { label: "Active Lecturers", value: adminData.overview.totalLecturers },
                ].map((s, i) => (
                    <Card
                        key={i}
                        className="rounded-xl p-5 transition-transform hover:-translate-y-1"
                    >
                        <p className="text-3xl font-black text-gray-900 dark:text-white">
                            {s.value}
                        </p>
                        <p className="mt-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                            {s.label}
                        </p>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-xl p-5 pb-8">
                    <h3 className="mb-6 font-bold dark:text-white">GPA Distribution By Level</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={adminData.performanceByLevel}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    strokeOpacity={0.1}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="level"
                                    tick={{ fontSize: 11 }}
                                    tickFormatter={(v) => `${v}L`}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    domain={[0, 5]}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: "transparent" }}
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "none",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                />
                                <Bar
                                    dataKey="averageGPA"
                                    fill="#3B82F6"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="rounded-xl p-6">
                    <h3 className="mb-6 font-bold dark:text-white">Most Active Courses</h3>
                    <div className="space-y-5">
                        {adminData.popularCourses.map((c, i) => (
                            <div key={i}>
                                <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                                    <span className="dark:text-white">{c.code}</span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {c.students} Students
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                                    <div
                                        className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500"
                                        style={{
                                            width: `${Math.min(100, (c.students / 100) * 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        {adminData.popularCourses.length === 0 && (
                            <p className="py-8 text-center text-sm text-gray-500">
                                No course data has been aggregated yet.
                            </p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
