"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useCourses } from "@/hooks/useCourses";
import { useAssessments } from "@/hooks/useAssessments";
import { useStudentAnalytics } from "@/hooks/useAnalytics";
import { BookOpen, ClipboardList, TrendingUp, Trophy, Clock, ArrowRight, AlertTriangle, CheckCircle2, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealtime } from "@/hooks/useRealtime";
import { useState, useEffect } from "react";

export function StudentDashboard() {
    const { data: session } = useAuth();
    const user = session?.user as any;

    const { data: courses, isLoading: coursesLoading } = useCourses();
    const { data: assessments, isLoading: assessmentsLoading } = useAssessments();
    const { data: analytics, isLoading: analyticsLoading } = useStudentAnalytics(user?.id);
    const { onlineUsers, lastUpdated } = useRealtime(user?.id);

    const [aiInsights, setAiInsights] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            setAiLoading(true);
            fetch(`/api/ai-insights/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    setAiInsights(data);
                    setAiLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch AI insights", err);
                    setAiLoading(false);
                });
        }
    }, [user?.id]);

    if (!user || analyticsLoading) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto">
                <Skeleton className="h-48 w-full rounded-3xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        { label: "Enrolled Courses", value: enrolledCount, icon: BookOpen, bgColor: "bg-blue-50 dark:bg-blue-900/30", textColor: "text-blue-700 dark:text-blue-400" },
        { label: "Current CGPA", value: currentGPA, icon: Trophy, bgColor: "bg-amber-50 dark:bg-amber-900/30", textColor: "text-amber-700 dark:text-amber-400" },
        { label: "Logins", value: analytics?.engagement?.loginCount || 0, icon: Target, bgColor: "bg-emerald-50 dark:bg-emerald-900/30", textColor: "text-emerald-700 dark:text-emerald-400" },
        { label: "Pending Tasks", value: pendingCount, icon: ClipboardList, bgColor: "bg-purple-50 dark:bg-purple-900/30", textColor: "text-purple-700 dark:text-purple-400" },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Dashboard Header with Live Badge */}
            <div className="flex justify-end mb-2 gap-3 items-center">
                <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium">
                    Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm border border-emerald-100 dark:border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    Live &bull; {onlineUsers} {onlineUsers === 1 ? 'user' : 'users'} online
                </div>
            </div>

            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20 isolate">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-amber-400/30 to-rose-400/30 rounded-full blur-3xl animate-float" />
                <div className="absolute -bottom-20 left-10 w-60 h-60 bg-gradient-to-tr from-cyan-400/30 to-blue-400/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

                <div className="relative z-10 animate-fade-in-up">
                    <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">Welcome back, {user.firstName}! 👋</h1>
                    <p className="text-indigo-200 mt-1 sm:mt-2 font-medium text-xs sm:text-base">
                        {user.matricNumber || "N/A"} • <span className="text-white bg-white/10 px-2 py-0.5 rounded-md">{user.level || 400} Level</span> • Dept. of Computer Science
                    </p>
                    <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 sm:mt-8">
                        <div className="glass px-3 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl min-w-0 flex-1 sm:flex-none">
                            <p className="text-[10px] sm:text-xs text-indigo-200 font-semibold mb-1 uppercase tracking-wider">Predicted Grade</p>
                            {aiLoading ? (
                                <Skeleton className="h-8 w-16 bg-white/20 mt-1" />
                            ) : (
                                <p className="text-xl sm:text-3xl font-black bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">{aiInsights?.predictedGrade || 0}%</p>
                            )}
                        </div>
                        <div className="glass px-3 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl min-w-0 flex-1 sm:flex-none">
                            <p className="text-[10px] sm:text-xs text-indigo-200 font-semibold mb-1 uppercase tracking-wider">Confidence</p>
                            {aiLoading ? (
                                <Skeleton className="h-8 w-16 bg-white/20 mt-1" />
                            ) : (
                                <p className="text-xl sm:text-3xl font-black bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">{aiInsights?.confidence || 0}%</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className={`glass-card rounded-xl sm:rounded-2xl p-3 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group animate-fade-in-up delay-${(i % 4) * 100 + 100}`}>
                        <div className="flex items-center justify-between">
                            <div className={`w-9 h-9 sm:w-12 sm:h-12 ${stat.bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                                <stat.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${stat.textColor}`} />
                            </div>
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <p className="text-xl sm:text-3xl font-black mt-2 sm:mt-4 dark:text-white">{stat.value}</p>
                        <p className="text-[10px] sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                {/* GPA Trend Chart */}
                <div className="md:col-span-2 glass-card rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">GPA Trend</h3>
                        <Link href="/dashboard/analytics" className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 font-semibold flex items-center gap-1 group">
                            Analytics <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <div className="h-48 sm:h-64">
                        {analytics?.gpaTrend && analytics.gpaTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics.gpaTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="semester" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                                    <Line type="monotone" dataKey="gpa" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#8b5cf6", r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
                                No GPA data available yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Recommendations */}
                <div className="glass-card rounded-2xl p-4 sm:p-6 transition-shadow hover:shadow-lg flex flex-col">
                    <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4 sm:mb-6 flex items-center gap-2">
                        <span className="text-xl sm:text-2xl animate-pulse">🤖</span> AI Insights
                    </h3>
                    {aiLoading ? (
                        <div className="space-y-3 flex-1">
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4 flex-1">
                            <div className="bg-blue-50/80 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-3 rounded-xl text-sm transition-all hover:shadow-sm">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                    <p className="font-medium text-gray-700 dark:text-gray-300">Strongest area: <span className="font-bold text-gray-900 dark:text-gray-100">{aiInsights?.strongestArea || 'N/A'}</span></p>
                                </div>
                            </div>
                            <div className="bg-rose-50/80 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 p-3 rounded-xl text-sm transition-all hover:shadow-sm">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                                    <p className="font-medium text-gray-700 dark:text-gray-300">Area to improve: <span className="font-bold text-gray-900 dark:text-gray-100">{aiInsights?.areaToImprove || 'N/A'}</span></p>
                                </div>
                            </div>
                            <div className="bg-emerald-50/80 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-3 rounded-xl text-sm transition-all hover:shadow-sm">
                                <div className="flex items-start gap-2">
                                    <Target className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                    <p className="font-medium text-gray-700 dark:text-gray-300"><span className="font-bold text-gray-900 dark:text-gray-100">Analysis:</span> {aiInsights?.explanation || 'Keep learning to get detailed insights.'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
