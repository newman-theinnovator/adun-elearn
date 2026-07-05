"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useCourses } from "@/hooks/useCourses";
import { Search, Users, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function CoursesPage() {
    const { data: session } = useAuth();
    const user = session?.user as any;
    const { data: courses, isLoading } = useCourses();

    const [search, setSearch] = useState("");
    const [levelFilter, setLevelFilter] = useState<string>("all");
    const [semFilter, setSemFilter] = useState<string>("all");

    if (isLoading || !courses) {
        return (
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex justify-between">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-16 w-full rounded-xl" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    const filtered = courses.filter((c: any) => {
        const matchSearch =
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase());
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
        "from-indigo-500 to-indigo-600",
    ];

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div>
                    <h1 className="text-xl font-bold sm:text-2xl dark:text-white">
                        {user?.role === "STUDENT" ? "My Courses" : "Course Management"}
                    </h1>
                    <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                        {filtered.length} courses available
                    </p>
                </div>
                {user?.role !== "STUDENT" && (
                    <button className="bg-navy-800 hover:bg-navy-700 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-md transition-colors sm:w-auto">
                        <BookOpen className="h-4 w-4" /> Create Course
                    </button>
                )}
            </div>

            {/* Filters */}
            <Card className="rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <label htmlFor="course-search" className="sr-only">
                            Search courses
                        </label>
                        <Input
                            id="course-search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search courses by title or code..."
                            className="rounded-lg py-2 pl-10"
                        />
                    </div>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger
                            aria-label="Filter by level"
                            className="rounded-lg py-2 sm:w-40"
                        >
                            <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="100">100 Level</SelectItem>
                            <SelectItem value="200">200 Level</SelectItem>
                            <SelectItem value="300">300 Level</SelectItem>
                            <SelectItem value="400">400 Level</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={semFilter} onValueChange={setSemFilter}>
                        <SelectTrigger
                            aria-label="Filter by semester"
                            className="rounded-lg py-2 sm:w-48"
                        >
                            <SelectValue placeholder="All Semesters" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Semesters</SelectItem>
                            <SelectItem value="FIRST">First Semester</SelectItem>
                            <SelectItem value="SECOND">Second Semester</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Course Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                                <div className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                    <div
                                        className={`h-28 bg-gradient-to-br ${courseColors[idx % courseColors.length]} flex flex-col justify-between p-4`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-bold text-white/90 shadow-sm backdrop-blur-sm">
                                                {c.code}
                                            </span>
                                            <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80 shadow-sm">
                                                {c.category || "General"}
                                            </span>
                                        </div>
                                        <h3 className="line-clamp-2 text-lg leading-tight font-bold text-white drop-shadow-md group-hover:underline">
                                            {c.title}
                                        </h3>
                                    </div>
                                    <div className="flex flex-1 flex-col p-4">
                                        <p className="mb-3 line-clamp-2 flex-1 text-xs text-gray-500 dark:text-gray-400">
                                            {c.description}
                                        </p>
                                        <div className="mb-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1 font-medium">
                                                <Users className="h-3 w-3 text-blue-500" />{" "}
                                                {c._count?.enrollments || 0}
                                            </span>
                                            <span className="flex items-center gap-1 font-medium">
                                                <BookOpen className="h-3 w-3 text-emerald-500" />{" "}
                                                {c._count?.modules || 0} modules
                                            </span>
                                            <span className="flex items-center gap-1 font-medium">
                                                <Clock className="h-3 w-3 text-amber-500" />{" "}
                                                {c.level}L
                                            </span>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white shadow-sm">
                                                    {c.instructor?.firstName?.[0] || ""}
                                                    {c.instructor?.lastName?.[0] || "U"}
                                                </div>
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                    {c.instructor?.firstName}{" "}
                                                    {c.instructor?.lastName}
                                                </span>
                                            </div>
                                            {user?.role === "STUDENT" && c.isEnrolled && (
                                                <div className="text-right">
                                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                        {progress}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {user?.role === "STUDENT" && c.isEnrolled && (
                                            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                                <div
                                                    className="h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
                                                    style={{ width: `${progress}%` }}
                                                />
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
