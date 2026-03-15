"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useStudentAnalytics, useCourseAnalytics, useDepartmentAnalytics } from "@/hooks/useAnalytics";
import { TrendingUp, Target, Brain, Activity, Download } from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, Radar,
    BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Legend
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
    const { data: session } = useAuth();
    const user = session?.user as any;
    const role = user?.role || "STUDENT";

    const { data: studentData, isLoading: studentLoading } = useStudentAnalytics(user?.id);
    const { data: adminData, isLoading: adminLoading } = useDepartmentAnalytics();

    // NOTE: A lecturer analytics page would typically first fetch active courses or select a specific course
    // We'll mimic the prototype's class general analytics view using department analytics if course is omitted, or a placeholder loading.
    const { data: lecturerData, isLoading: lecturerLoading } = useCourseAnalytics("placeholder-course");

    const COLORS = ["#10B981", "#3B82F6", "#6366F1", "#F59E0B", "#EF4444"];

    if (!user || studentLoading || adminLoading) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-40 w-full rounded-2xl" />
                <div className="grid lg:grid-cols-2 gap-6">
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
            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">My Performance Analytics</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track your academic progress and get personalized insights</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 bg-blue-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:bg-blue-800 transition-all">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>

                {/* Prediction Card */}
                <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-purple-800 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4"><Brain className="w-6 h-6 text-emerald-300" /><h3 className="font-bold text-lg text-emerald-50">AI Grade Prediction Engine</h3></div>
                        <div className="grid sm:grid-cols-3 gap-4 lg:gap-6">
                            <div className="bg-white/10 rounded-xl p-5 backdrop-blur-md border border-white/20 shadow-inner">
                                <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Current CGPA</p>
                                <p className="text-4xl font-black mt-2 tracking-tight">{studentData.cgpa}</p>
                                <p className="text-[10px] text-blue-300 mt-2">Based on {studentData.gpaTrend?.length || 0} semesters</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-5 backdrop-blur-md border border-amber-300/30 shadow-inner">
                                <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">Predicted Final Grade</p>
                                <p className="text-4xl font-black mt-2 text-amber-400 tracking-tight">{studentData.predictions?.predictedScore || "N/A"}%</p>
                                <p className="text-[10px] text-amber-200/70 mt-2">Using multi-factor trend analysis</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-5 backdrop-blur-md border border-emerald-300/30 shadow-inner">
                                <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Model Confidence</p>
                                <p className="text-4xl font-black mt-2 text-emerald-400 tracking-tight">{studentData.predictions?.confidence || 0}%</p>
                                <p className="text-[10px] text-emerald-200/70 mt-2">Based on historical data completeness</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* GPA Trend */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 hover:shadow-md transition-shadow">
                        <h3 className="font-bold mb-6 flex items-center gap-2 dark:text-white"><TrendingUp className="w-5 h-5 text-blue-500" /> GPA Progression</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={studentData.gpaTrend || []}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                                    <XAxis dataKey="semester" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="gpa" stroke="#3B82F6" fill="url(#colorGpa)" strokeWidth={3} />
                                    <defs>
                                        <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Engagement */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 hover:shadow-md transition-shadow">
                        <h3 className="font-bold mb-6 flex items-center gap-2 dark:text-white"><Activity className="w-5 h-5 text-emerald-500" /> Active Engagement</h3>
                        <div className="grid grid-cols-2 gap-4 h-full pb-8">
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-600">
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Logins</p>
                                <p className="text-4xl font-black text-blue-600 dark:text-blue-400">{studentData.engagement?.loginCount || 0}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-600">
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Time Spent</p>
                                <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{Math.round((studentData.engagement?.totalTimeSpentMinutes || 0) / 60)}h</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -z-0" />
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2 dark:text-white relative z-10"><span className="text-2xl">💡</span> Key Insights</h3>
                    <div className="grid md:grid-cols-2 gap-4 relative z-10">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-xl transition-all hover:shadow-sm">
                            <h4 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2">Great Work</h4>
                            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">{studentData.strengths}</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-5 rounded-xl transition-all hover:shadow-sm">
                            <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2">Focus Areas</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300 font-medium leading-relaxed">{studentData.weaknesses}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------------------
    // LECTURER / ADMIN VIEW (Consolidated for brevity using Department Analytics as Admin is fully developed)
    // ------------------------------------------------------------------------
    if (!adminData) return null;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">{role === "ADMIN" ? "Department Analytics" : "Advanced Analytics"}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">High-level overview of system and student performance.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:bg-blue-800 transition-all"><Download className="w-4 h-4" /> Export Report Data</button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Enrollments", value: adminData.overview.activeEnrollments },
                    { label: "Active Courses", value: adminData.overview.totalCourses },
                    { label: "Avg Department GPA", value: adminData.overview.departmentAverageGPA },
                    { label: "Active Lecturers", value: adminData.overview.totalLecturers },
                ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm transition-transform hover:-translate-y-1">
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{s.value}</p>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-2">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 pb-8">
                    <h3 className="font-bold mb-6 dark:text-white">GPA Distribution By Level</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={adminData.performanceByLevel}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                                <XAxis dataKey="level" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}L`} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11 }} domain={[0, 5]} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="averageGPA" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                    <h3 className="font-bold mb-6 dark:text-white">Most Active Courses</h3>
                    <div className="space-y-5">
                        {adminData.popularCourses.map((c, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                                    <span className="dark:text-white">{c.code}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{c.students} Students</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-emerald-400 to-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (c.students / 100) * 100)}%` }} />
                                </div>
                            </div>
                        ))}
                        {adminData.popularCourses.length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-8">No course data has been aggregated yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
