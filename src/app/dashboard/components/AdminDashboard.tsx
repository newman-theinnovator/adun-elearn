"use client";

import { useDepartmentAnalytics } from "@/hooks/useAnalytics";
import { Users, BookOpen, TrendingUp, GraduationCap, Download, FileText, Table } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
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
            head: [['Metric', 'Value']],
            body: [
                ['Total Students', admin.overview.totalStudents.toString()],
                ['Total Lecturers', admin.overview.totalLecturers.toString()],
                ['Active Courses', admin.overview.totalCourses.toString()],
                ['Department Average CGPA', admin.overview.departmentAverageGPA.toString()]
            ],
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });

        doc.text("Average GPA by Level", 14, (doc as any).lastAutoTable.finalY + 15);
        const levelData = admin.performanceByLevel.map(item => [
            `${item.level} Level`, 
            item.averageGPA.toString()
        ]);
        
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Academic Level', 'Average CGPA']],
            body: levelData,
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129] }
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
        admin.performanceByLevel.forEach(item => {
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
            <div className="space-y-6 max-w-7xl mx-auto">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
                <div className="grid lg:grid-cols-3 gap-6">
                    <Skeleton className="h-64 w-full rounded-2xl lg:col-span-2" />
                    <Skeleton className="h-64 w-full rounded-2xl lg:col-span-1" />
                </div>
            </div>
        );
    }

    const stats = [
        { label: "Total Students", value: admin.overview.totalStudents, icon: Users, bg: "bg-blue-50 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" },
        { label: "Total Lecturers", value: admin.overview.totalLecturers, icon: GraduationCap, bg: "bg-emerald-50 dark:bg-emerald-900/30", color: "text-emerald-600 dark:text-emerald-400" },
        { label: "Active Courses", value: admin.overview.totalCourses, icon: BookOpen, bg: "bg-purple-50 dark:bg-purple-900/30", color: "text-purple-600 dark:text-purple-400" },
        { label: "Dept Average CGPA", value: admin.overview.departmentAverageGPA, icon: TrendingUp, bg: "bg-amber-50 dark:bg-amber-900/30", color: "text-amber-600 dark:text-amber-400" },
    ];

    const COLORS = ["#3B82F6", "#10B981", "#6366F1", "#F59E0B"];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold dark:text-white">Department Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Software Engineering Department, ADUN</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap hidden md:inline-block">
                        Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm border border-emerald-100 dark:border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        Live &bull; {onlineUsers} {onlineUsers === 1 ? 'user' : 'users'} online
                    </div>
                    <div className="flex bg-blue-900 rounded-lg overflow-hidden shadow-md">
                        <button onClick={handleExportPDF} className="flex items-center gap-2 text-white px-3 py-2 text-xs sm:text-sm font-medium hover:bg-blue-800 transition-colors border-r border-blue-800 focus:outline-none">
                            <FileText className="w-4 h-4" /> PDF
                        </button>
                        <button onClick={handleExportCSV} className="flex items-center gap-2 text-white px-3 py-2 text-xs sm:text-sm font-medium hover:bg-blue-800 transition-colors focus:outline-none">
                            <Table className="w-4 h-4" /> CSV
                        </button>
                    </div>
                </div>
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
                {/* GPA Distribution By Level */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-5">
                    <h3 className="font-semibold text-sm sm:text-base mb-4 dark:text-white">Average GPA by Level</h3>
                    <div className="h-48 sm:h-56">
                        {admin.performanceByLevel && admin.performanceByLevel.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={admin.performanceByLevel}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis dataKey="level" tick={{ fontSize: 10 }} tickFormatter={(val) => `${val} Level`} />
                                    <YAxis tick={{ fontSize: 10 }} domain={[0, 5]} />
                                    <Tooltip contentStyle={{ borderRadius: "8px" }} />
                                    <Bar dataKey="averageGPA" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
                                No performance data available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Course Popularity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                    <h3 className="font-semibold mb-4 dark:text-white">Most Popular Courses</h3>
                    <div className="space-y-4 pt-2">
                        {admin.popularCourses.length > 0 ? admin.popularCourses.map((c, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium dark:text-white truncate pr-2">{c.code}</span>
                                    <span className="text-gray-500 text-xs flex-shrink-0">{c.students} enrolled</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(100, (c.students / 50) * 100)}%` }} />
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500">No course data available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
