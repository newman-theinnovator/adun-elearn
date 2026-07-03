"use client";

import { useDepartmentAnalytics } from "@/hooks/useAnalytics";
import { Users, BookOpen, TrendingUp, GraduationCap, FileText, Table } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/AuthProvider";
import { useRealtime } from "@/hooks/useRealtime";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function AdminDashboard() {
    const { data: session } = useAuth();
    const user = session?.user as any;

    const { data: admin, isLoading } = useDepartmentAnalytics();
    const { onlineUsers, lastUpdated } = useRealtime(user?.id);

    const handleExportPDF = () => {
        if (!admin) return;
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("Department Performance Report", 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Overview Statistics", 14, 45);

        autoTable(doc, {
            startY: 50,
            head: [["Metric", "Value"]],
            body: [
                ["Total Students", admin.overview.totalStudents.toString()],
                ["Total Lecturers", admin.overview.totalLecturers.toString()],
                ["Active Courses", admin.overview.totalCourses.toString()],
                ["Department Average CGPA", admin.overview.departmentAverageGPA.toString()],
            ],
            theme: "grid",
            headStyles: { fillColor: [59, 130, 246] },
        });

        doc.text("Average GPA by Level", 14, (doc as any).lastAutoTable.finalY + 15);
        const levelData = admin.performanceByLevel.map((item) => [
            `${item.level} Level`,
            item.averageGPA.toString(),
        ]);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [["Academic Level", "Average CGPA"]],
            body: levelData,
            theme: "striped",
            headStyles: { fillColor: [16, 185, 129] },
        });

        doc.save("department-report.pdf");
    };

    const handleExportCSV = () => {
        if (!admin) return;
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Metric,Value\n";
        csvContent += `Total Students,${admin.overview.totalStudents}\n`;
        csvContent += `Total Lecturers,${admin.overview.totalLecturers}\n`;
        csvContent += `Active Courses,${admin.overview.totalCourses}\n`;
        csvContent += `Department Average CGPA,${admin.overview.departmentAverageGPA}\n\n`;

        csvContent += "Academic Level,Average CGPA\n";
        admin.performanceByLevel.forEach((item) => {
            csvContent += `${item.level} Level,${item.averageGPA}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "department-performance.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading || !admin) {
        return (
            <div className="mx-auto max-w-7xl space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    <Skeleton className="h-64 w-full rounded-2xl lg:col-span-2" />
                    <Skeleton className="h-64 w-full rounded-2xl lg:col-span-1" />
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: "Total Students",
            value: admin.overview.totalStudents,
            icon: Users,
            bg: "bg-blue-50 dark:bg-blue-900/30",
            color: "text-blue-600 dark:text-blue-400",
        },
        {
            label: "Total Lecturers",
            value: admin.overview.totalLecturers,
            icon: GraduationCap,
            bg: "bg-emerald-50 dark:bg-emerald-900/30",
            color: "text-emerald-600 dark:text-emerald-400",
        },
        {
            label: "Active Courses",
            value: admin.overview.totalCourses,
            icon: BookOpen,
            bg: "bg-purple-50 dark:bg-purple-900/30",
            color: "text-purple-600 dark:text-purple-400",
        },
        {
            label: "Dept Average CGPA",
            value: admin.overview.departmentAverageGPA,
            icon: TrendingUp,
            bg: "bg-amber-50 dark:bg-amber-900/30",
            color: "text-amber-600 dark:text-amber-400",
        },
    ];

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div>
                    <h1 className="text-xl font-bold sm:text-2xl dark:text-white">
                        Department Overview
                    </h1>
                    <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                        Software Engineering Department, ADUN
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="hidden text-[10px] font-medium whitespace-nowrap text-gray-400 sm:text-xs md:inline-block dark:text-gray-500">
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
                    <div className="flex overflow-hidden rounded-lg bg-blue-900 shadow-md">
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 border-r border-blue-800 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-800 focus:outline-none sm:text-sm"
                        >
                            <FileText className="h-4 w-4" /> PDF
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-800 focus:outline-none sm:text-sm"
                        >
                            <Table className="h-4 w-4" /> CSV
                        </button>
                    </div>
                </div>
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
                {/* GPA Distribution By Level */}
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-4 text-sm font-semibold sm:text-base dark:text-white">
                        Average GPA by Level
                    </h3>
                    <div className="h-48 sm:h-56">
                        {admin.performanceByLevel && admin.performanceByLevel.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={admin.performanceByLevel}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f0f0f0"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="level"
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={(val) => `${val} Level`}
                                    />
                                    <YAxis tick={{ fontSize: 10 }} domain={[0, 5]} />
                                    <Tooltip contentStyle={{ borderRadius: "8px" }} />
                                    <Bar
                                        dataKey="averageGPA"
                                        fill="#3B82F6"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                No performance data available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Course Popularity */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-4 font-semibold dark:text-white">Most Popular Courses</h3>
                    <div className="space-y-4 pt-2">
                        {admin.popularCourses.length > 0 ? (
                            admin.popularCourses.map((c, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="truncate pr-2 font-medium dark:text-white">
                                            {c.code}
                                        </span>
                                        <span className="flex-shrink-0 text-xs text-gray-500">
                                            {c.students} enrolled
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                            style={{
                                                width: `${Math.min(100, (c.students / 50) * 100)}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No course data available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
