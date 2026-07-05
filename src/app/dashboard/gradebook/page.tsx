"use client";

import { useAuth } from "@/providers/AuthProvider";
import { Award, TrendingUp, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
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
            <div className="mx-auto max-w-5xl space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

    const gradeVariant = (grade: string): "success" | "info" | "warning" | "destructive" => {
        if (grade.startsWith("A")) return "success";
        if (grade.startsWith("B")) return "info";
        if (grade.startsWith("C")) return "warning";
        return "destructive";
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold dark:text-white">Academic Gradebook</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Official performance records and cumulative GPA
                </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="from-navy-900 to-navy-700 relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-lg">
                    <div className="absolute top-0 right-0 flex h-32 w-32 items-center justify-center rounded-full bg-white/10 blur-2xl">
                        <Award className="h-16 w-16 text-white/10" />
                    </div>
                    <div className="relative z-10">
                        <Award className="mb-2 h-8 w-8 text-amber-400" />
                        <p className="text-4xl font-black">{cgpa}</p>
                        <p className="mt-1 text-sm font-medium tracking-wider text-blue-200 uppercase">
                            Cumulative GPA
                        </p>
                    </div>
                </div>

                <Card className="p-6 transition-transform hover:-translate-y-1">
                    <TrendingUp className="mb-2 h-8 w-8 text-emerald-500" />
                    <p className="text-4xl font-black text-gray-900 dark:text-white">
                        {grades.filter((g) => g.gradePoint >= 3.5).length}
                        <span className="text-2xl text-gray-400">/{grades.length}</span>
                    </p>
                    <p className="mt-1 text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Courses with B+ or higher
                    </p>
                </Card>

                <Card className="p-6 transition-transform hover:-translate-y-1">
                    <BookOpen className="mb-2 h-8 w-8 text-blue-500" />
                    <p className="text-4xl font-black text-gray-900 dark:text-white">
                        {Math.round(
                            grades.reduce((a, g) => a + g.totalScore, 0) / (grades.length || 1)
                        )}
                        %
                    </p>
                    <p className="mt-1 text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Overall Average Score
                    </p>
                </Card>
            </div>

            {/* Grades Table */}
            <Card>
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">
                        Current Semester Transcripts
                    </h3>
                    {grades.length > 0 && (
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {grades[0].session} — {grades[0].semester} Semester
                        </span>
                    )}
                </div>
                <Table>
                    <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                        <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                            <TableHead className="text-gray-600 dark:text-gray-300">
                                Course Details
                            </TableHead>
                            <TableHead className="text-center text-gray-600 dark:text-gray-300">
                                CA1
                            </TableHead>
                            <TableHead className="text-center text-gray-600 dark:text-gray-300">
                                CA2
                            </TableHead>
                            <TableHead className="text-center text-gray-600 dark:text-gray-300">
                                Exam
                            </TableHead>
                            <TableHead className="bg-blue-50/50 text-center text-blue-600 dark:bg-blue-900/10 dark:text-blue-400">
                                Total %
                            </TableHead>
                            <TableHead className="text-center text-gray-600 dark:text-gray-300">
                                Grade
                            </TableHead>
                            <TableHead className="bg-emerald-50/50 text-center text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400">
                                GP
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {grades.map((g, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        {g.courseCode}
                                    </p>
                                    <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {g.courseTitle}
                                    </p>
                                </TableCell>
                                <TableCell className="text-center font-medium text-gray-600 dark:text-gray-300">
                                    {g.quizAvg > 0 ? `${g.quizAvg}` : "—"}
                                </TableCell>
                                <TableCell className="text-center font-medium text-gray-600 dark:text-gray-300">
                                    {g.assignmentAvg > 0 ? `${g.assignmentAvg}` : "—"}
                                </TableCell>
                                <TableCell className="text-center font-medium text-gray-600 dark:text-gray-300">
                                    {g.examScore > 0 ? `${g.examScore}` : "—"}
                                </TableCell>
                                <TableCell className="bg-blue-50/20 text-center font-black text-gray-900 dark:bg-blue-900/5 dark:text-white">
                                    {g.totalScore > 0 ? `${g.totalScore}%` : "—"}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge
                                        variant={gradeVariant(g.grade)}
                                        className="border border-current/10 font-black shadow-sm"
                                    >
                                        {g.grade}
                                    </Badge>
                                </TableCell>
                                <TableCell className="bg-emerald-50/20 text-center font-black text-emerald-700 dark:bg-emerald-900/5 dark:text-emerald-400">
                                    {g.gradePoint > 0 ? g.gradePoint.toFixed(1) : "—"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {grades.length === 0 && (
                    <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                        <Award className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                        <p className="font-medium">No recorded grades for this academic session.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
