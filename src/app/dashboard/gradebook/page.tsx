"use client";

import { useAuth } from "@/providers/AuthProvider";
import { Award, TrendingUp, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGrades } from "@/hooks/useGrades";
import { useStudentAnalytics } from "@/hooks/useAnalytics";

export default function GradebookPage() {
    const { data: session } = useAuth();
    const user = session?.user as any;
    const { data: analyticsData, isLoading: analyticsLoading } = useStudentAnalytics(user?.id);
    const { data: gradesData, isLoading: gradesLoading } = useGrades();

    const isLoading = analyticsLoading || gradesLoading;

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        );
    }

    const cgpa = analyticsData?.cgpa || "0.00";

    // Map Prisma grade records to display format
    const grades = (gradesData || []).map((g) => ({
        courseCode: g.course?.code || "—",
        courseTitle: g.course?.title || "Unknown Course",
        quizAvg: g.ca1 ?? 0,
        assignmentAvg: g.ca2 ?? 0,
        examScore: g.exam ?? 0,
        totalScore: g.total ?? 0,
        grade: g.grade || "—",
        gradePoint: g.gradePoint ?? 0,
        semester: g.semester,
        session: g.session,
    }));

    const gradeColor = (grade: string) => {
        if (grade.startsWith("A")) return "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400";
        if (grade.startsWith("B")) return "text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
        if (grade.startsWith("C")) return "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400";
        return "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold dark:text-white">Academic Gradebook</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Official performance records and cumulative GPA</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-900 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl flex items-center justify-center">
                        <Award className="w-16 h-16 text-white/10" />
                    </div>
                    <div className="relative z-10">
                        <Award className="w-8 h-8 text-amber-400 mb-2" />
                        <p className="text-4xl font-black">{cgpa}</p>
                        <p className="text-blue-200 text-sm font-medium mt-1 uppercase tracking-wider">Cumulative GPA</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 hover:-translate-y-1 transition-transform">
                    <TrendingUp className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="text-4xl font-black dark:text-white text-gray-900">{grades.filter((g) => g.gradePoint >= 3.5).length}<span className="text-2xl text-gray-400">/{grades.length}</span></p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1 uppercase tracking-wider">Courses with B+ or higher</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 hover:-translate-y-1 transition-transform">
                    <BookOpen className="w-8 h-8 text-blue-500 mb-2" />
                    <p className="text-4xl font-black dark:text-white text-gray-900">{Math.round(grades.reduce((a, g) => a + g.totalScore, 0) / (grades.length || 1))}%</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1 uppercase tracking-wider">Overall Average Score</p>
                </div>
            </div>

            {/* Grades Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">Current Semester Transcripts</h3>
                    {grades.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {grades[0].session} — {grades[0].semester} Semester
                        </span>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                            <tr>
                                <th className="text-left py-4 px-5 font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Course Details</th>
                                <th className="text-center py-4 px-5 font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">CA1</th>
                                <th className="text-center py-4 px-5 font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">CA2</th>
                                <th className="text-center py-4 px-5 font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Exam</th>
                                <th className="text-center py-4 px-5 font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-xs bg-blue-50/50 dark:bg-blue-900/10">Total %</th>
                                <th className="text-center py-4 px-5 font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Grade</th>
                                <th className="text-center py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-xs bg-emerald-50/50 dark:bg-emerald-900/10">GP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {grades.map((g, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="py-4 px-5">
                                        <p className="font-bold text-gray-900 dark:text-white">{g.courseCode}</p>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{g.courseTitle}</p>
                                    </td>
                                    <td className="text-center py-4 px-5 font-medium text-gray-600 dark:text-gray-300">{g.quizAvg > 0 ? `${g.quizAvg}` : "—"}</td>
                                    <td className="text-center py-4 px-5 font-medium text-gray-600 dark:text-gray-300">{g.assignmentAvg > 0 ? `${g.assignmentAvg}` : "—"}</td>
                                    <td className="text-center py-4 px-5 font-medium text-gray-600 dark:text-gray-300">{g.examScore > 0 ? `${g.examScore}` : "—"}</td>
                                    <td className="text-center py-4 px-5 font-black text-gray-900 dark:text-white bg-blue-50/20 dark:bg-blue-900/5">{g.totalScore > 0 ? `${g.totalScore}%` : "—"}</td>
                                    <td className="text-center py-4 px-5">
                                        <span className={`text-xs font-black px-3 py-1.5 rounded-md shadow-sm border border-current/10 ${gradeColor(g.grade)}`}>{g.grade}</span>
                                    </td>
                                    <td className="text-center py-4 px-5 font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-900/5">{g.gradePoint > 0 ? g.gradePoint.toFixed(1) : "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {grades.length === 0 && (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                            <Award className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="font-medium">No recorded grades for this academic session.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
