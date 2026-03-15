"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useCourses } from "@/hooks/useCourses";
import { Search, Users, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesPage() {
    const { data: session } = useAuth();
    const user = session?.user as any;
    const { data: courses, isLoading } = useCourses();

    const [search, setSearch] = useState("");
    const [levelFilter, setLevelFilter] = useState<string>("all");
    const [semFilter, setSemFilter] = useState<string>("all");

    if (isLoading || !courses) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex justify-between">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-16 w-full rounded-xl" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    const filtered = courses.filter((c: any) => {
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
        const matchLevel = levelFilter === "all" || c.level === parseInt(levelFilter);
        const matchSem = semFilter === "all" || c.semester === semFilter;
        return matchSearch && matchLevel && matchSem;
    });

    const courseColors = [
        "from-blue-500 to-blue-600",
        "from-purple-500 to-purple-600",
        "from-emerald-500 to-emerald-600",
        "from-amber-500 to-amber-600",
        "from-pink-500 to-pink-600",
        "from-indigo-500 to-indigo-600"
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold dark:text-white">
                        {user?.role === "STUDENT" ? "My Courses" : "Course Management"}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{filtered.length} courses available</p>
                </div>
                {user?.role !== "STUDENT" && (
                    <button className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shadow-md">
                        <BookOpen className="w-4 h-4" /> Create Course
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search courses by title or code..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                        />
                    </div>
                    <select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                        <option value="all">All Levels</option>
                        <option value="100">100 Level</option>
                        <option value="200">200 Level</option>
                        <option value="300">300 Level</option>
                        <option value="400">400 Level</option>
                    </select>
                    <select
                        value={semFilter}
                        onChange={(e) => setSemFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                        <option value="all">All Semesters</option>
                        <option value="FIRST">First Semester</option>
                        <option value="SECOND">Second Semester</option>
                    </select>
                </div>
            </div>

            {/* Course Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No courses found matching your criteria.
                    </div>
                ) : (
                    filtered.map((c: any, idx: number) => {
                        // Placeholder logic since modules might not be eagerly loaded for list view
                        const progress = c.isEnrolled ? 45 : 0;

                        return (
                            <Link key={c.id} href={`/dashboard/courses/${c.id}`}>
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group h-full flex flex-col hover:-translate-y-1">
                                    <div className={`h-28 bg-gradient-to-br ${courseColors[idx % courseColors.length]} p-4 flex flex-col justify-between`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm shadow-sm">{c.code}</span>
                                            <span className="text-xs font-medium text-white/80 bg-white/10 px-2 py-0.5 rounded shadow-sm">{c.category || "General"}</span>
                                        </div>
                                        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 group-hover:underline drop-shadow-md">{c.title}</h3>
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-1">{c.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                            <span className="flex items-center gap-1 font-medium"><Users className="w-3 h-3 text-blue-500" /> {c._count?.enrollments || 0}</span>
                                            <span className="flex items-center gap-1 font-medium"><BookOpen className="w-3 h-3 text-emerald-500" /> {c._count?.modules || 0} modules</span>
                                            <span className="flex items-center gap-1 font-medium"><Clock className="w-3 h-3 text-amber-500" /> {c.level}L</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                                    {c.instructor?.firstName?.[0] || ""}{c.instructor?.lastName?.[0] || "U"}
                                                </div>
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                    {c.instructor?.firstName} {c.instructor?.lastName}
                                                </span>
                                            </div>
                                            {user?.role === "STUDENT" && c.isEnrolled && (
                                                <div className="text-right">
                                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
                                                </div>
                                            )}
                                        </div>
                                        {user?.role === "STUDENT" && c.isEnrolled && (
                                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-3 overflow-hidden">
                                                <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
