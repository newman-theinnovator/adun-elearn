"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useCourse, useEnroll } from "@/hooks/useCourses";
import { useAssessments } from "@/hooks/useAssessments";
import { useForumPosts } from "@/hooks/useFeatures";
import { useLogActivity } from "@/hooks/useActivity";
import {
    BookOpen, Video, FileText, Link2, Type, ChevronDown, ChevronRight,
    CheckCircle2, Circle, Clock, Users, ClipboardList, MessageSquare,
    Download, Play, AlertCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailPage() {
    const { id } = useParams() as { id: string };
    const { data: session } = useAuth();
    const user = session?.user as any;
    const { mutate: logActivity } = useLogActivity();

    const [activeTab, setActiveTab] = useState<"content" | "assessments" | "discussion" | "info">("content");
    const [expandedModule, setExpandedModule] = useState<string | null>(null);

    const { data: course, isLoading: courseLoading } = useCourse(id);
    const { data: assessments, isLoading: assessmentsLoading } = useAssessments();
    const { data: forumPosts, isLoading: forumLoading } = useForumPosts(id);
    const { mutate: enroll, isPending: enrollPending } = useEnroll();

    // Log course view activity
    useEffect(() => {
        if (course && user) {
            logActivity({ action: "VIEW_COURSE", metadata: { courseId: id } });
        }
    }, [course?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    if (courseLoading || !course) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        );
    }

    const courseAssessments = assessments?.filter(a => a.courseId === course.id) || [];
    const courseForums = forumPosts || [];

    // TODO: Add module completion tracking in DB
    const completedModules = course.modules?.length ? 2 : 0;
    const progress = Math.round((completedModules / (course.modules?.length || 1)) * 100);

    const contentIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "video": return <Video className="w-4 h-4 text-red-500" />;
            case "pdf": return <FileText className="w-4 h-4 text-red-600" />;
            case "document": return <FileText className="w-4 h-4 text-blue-600" />;
            case "link": return <Link2 className="w-4 h-4 text-green-600" />;
            case "text": return <Type className="w-4 h-4 text-gray-600" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const tabs = [
        { id: "content" as const, label: "Course Content", icon: BookOpen },
        { id: "assessments" as const, label: "Assessments", icon: ClipboardList },
        { id: "discussion" as const, label: "Discussion", icon: MessageSquare },
        { id: "info" as const, label: "Course Info", icon: FileText },
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Course Header */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl" />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded shadow-sm">{course.code}</span>
                            <span className="text-xs font-medium bg-white/10 px-2 py-0.5 rounded shadow-sm capitalize">{course.semester} Semester</span>
                            <span className="text-xs font-medium bg-white/10 px-2 py-0.5 rounded shadow-sm">{course.level} Level</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mt-2">{course.title}</h1>
                    <p className="text-blue-100 text-sm mt-2 max-w-2xl line-clamp-2">{course.description}</p>

                    <div className="flex flex-wrap items-center justify-between mt-6">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                            <span className="flex items-center gap-1 font-medium"><Users className="w-4 h-4" /> {course._count?.enrollments || 0} students</span>
                            <span className="flex items-center gap-1 font-medium"><BookOpen className="w-4 h-4" /> {course.modules.length} modules</span>
                            <span className="font-medium">Lecturer: <strong className="text-white">{course.instructor?.firstName} {course.instructor?.lastName}</strong></span>
                        </div>

                        {user?.role === "STUDENT" && !course.isEnrolled && (
                            <button
                                onClick={() => enroll(course.id)}
                                disabled={enrollPending}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
                            >
                                {enrollPending ? "Enrolling..." : "Enroll in Course"}
                            </button>
                        )}
                    </div>

                    {user?.role === "STUDENT" && course.isEnrolled && (
                        <div className="mt-6 bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-sm">
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-blue-100 font-medium">Your Progress</span>
                                <span className="font-bold">{progress}%</span>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-400 to-amber-300 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!course.isEnrolled && user?.role === "STUDENT" && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl flex items-start gap-3 text-amber-800 dark:text-amber-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">You need to enroll in this course to access modules, submit assessments, and participate in discussions.</p>
                </div>
            )}

            {/* Tabs */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all ${!course.isEnrolled && user?.role === "STUDENT" ? "opacity-60 pointer-events-none" : ""}`}>
                <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto hide-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-gray-700/50" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:hover:text-gray-300 transform-colors"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    {/* Content Tab */}
                    {activeTab === "content" && (
                        <div className="space-y-3">
                            {course.modules.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">No modules have been added to this course yet.</p>
                            ) : (
                                course.modules.map((mod: any, index: number) => (
                                    <div key={mod.id} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden transition-all hover:border-blue-200 dark:hover:border-blue-500/30">
                                        <button
                                            onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Placeholder for completion tracking */}
                                                <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                                                <div className="text-left">
                                                    <p className="font-semibold text-sm dark:text-white">Module {mod.order}: {mod.title}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{mod.description || "No description provided."}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">{mod.contents?.length || 0} items</span>
                                                {expandedModule === mod.id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                                            </div>
                                        </button>
                                        {expandedModule === mod.id && mod.contents && mod.contents.length > 0 && (
                                            <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-3 space-y-2">
                                                {mod.contents.map((content: any) => (
                                                    <a key={content.id} href={content.url || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-sm transition-all cursor-pointer group">
                                                        <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                                                            {contentIcon(content.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{content.title}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">{content.type.toLowerCase()} • Included content</p>
                                                        </div>
                                                        {content.type.toLowerCase() === "video" ? (
                                                            <Play className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                                        ) : (
                                                            <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                                        )}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Assessments Tab */}
                    {activeTab === "assessments" && (
                        <div className="space-y-3">
                            {courseAssessments.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">No assessments found for this course.</p>
                            ) : (
                                courseAssessments.map(a => (
                                    <div key={a.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-blue-200 dark:hover:border-blue-500/50 transition-colors group">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${a.type.toLowerCase() === "quiz" ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`}>
                                            <ClipboardList className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{a.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{a.description || "No specific instructions."}</p>
                                            <div className="flex flex-wrap gap-2 mt-2 text-[10px] sm:text-xs">
                                                <span className="capitalize font-medium bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">{a.type.toLowerCase()}</span>
                                                <span className="font-medium bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">{a.totalMarks} points</span>
                                                {a.timeLimit && <span className="font-medium bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">{a.timeLimit} min timer</span>}
                                            </div>
                                        </div>
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
                                            <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${a.isPublished ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                                                {a.isPublished ? "Active" : "Draft"}
                                            </span>
                                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                Due: {new Date(a.dueDate).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Discussion Tab */}
                    {activeTab === "discussion" && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Join the course conversation</p>
                                <button className="bg-blue-900 text-white px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-semibold hover:bg-blue-800 shadow-md transition-all scale-active-95">
                                    <MessageSquare className="w-4 h-4" /> New Thread
                                </button>
                            </div>

                            {forumLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-32 w-full rounded-xl" />
                                    <Skeleton className="h-32 w-full rounded-xl" />
                                </div>
                            ) : courseForums.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-gray-500">No discussions posted yet.</p>
                                    <p className="text-xs text-gray-400 mt-1">Be the first to start a conversation!</p>
                                </div>
                            ) : (
                                courseForums.map((post: any) => (
                                    <div key={post.id} className={`border rounded-xl p-4 transition-all hover:shadow-md ${post.isPinned ? "border-amber-200 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-900/20" : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"}`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${post.author.role === "LECTURER" ? "bg-blue-500" : "bg-emerald-500"}`}>
                                                {post.author.firstName?.[0] || ""}{post.author.lastName?.[0] || "U"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="font-bold text-sm dark:text-white">{post.author.firstName} {post.author.lastName}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded capitalize font-semibold ${post.author.role === "LECTURER" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"}`}>{post.author.role.toLowerCase()}</span>
                                                    {post.isPinned && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 px-2 py-0.5 rounded">📌 Pinned</span>}
                                                </div>
                                                <h4 className="font-bold text-base mt-2 dark:text-white text-gray-900">{post.title}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5 whitespace-pre-line leading-relaxed">{post.body}</p>

                                                <div className="flex items-center gap-4 mt-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors"><MessageSquare className="w-3.5 h-3.5" /> {post._count?.replies || 0} replies</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(post.createdAt).toLocaleDateString("en-NG")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Info Tab */}
                    {activeTab === "info" && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div>
                                <h3 className="font-bold text-lg mb-2 dark:text-white text-gray-900">About this Course</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">{course.description}</p>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                                    <h4 className="font-bold text-sm mb-4 dark:text-white flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-500" /> Academic Details</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500 dark:text-gray-400">Course Code</span><span className="font-bold text-gray-900 dark:text-white">{course.code}</span></div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500 dark:text-gray-400">Level</span><span className="font-semibold text-gray-700 dark:text-gray-200">{course.level} Level</span></div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500 dark:text-gray-400">Semester</span><span className="font-semibold text-gray-700 dark:text-gray-200 capitalize">{course.semester}</span></div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500 dark:text-gray-400">Semester</span><span className="font-semibold text-gray-700 dark:text-gray-200 capitalize">{course.semester}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-gray-400">Status</span><span className="font-semibold text-blue-600 dark:text-blue-400 capitalize bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">Active</span></div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                                    <h4 className="font-bold text-sm mb-4 dark:text-white flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" /> Enrollment Stats</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500 dark:text-gray-400">Enrolled Students</span><span className="font-bold text-gray-900 dark:text-white">{course._count?.enrollments || 0}</span></div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500 dark:text-gray-400">Max Capacity</span><span className="font-semibold text-gray-700 dark:text-gray-200">Unlimited</span></div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500 dark:text-gray-400">Course Instructor</span><span className="font-semibold text-gray-700 dark:text-gray-200">{course.instructor?.firstName} {course.instructor?.lastName}</span></div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-700/50"><span className="text-gray-500 dark:text-gray-400">Total Modules</span><span className="font-semibold text-gray-700 dark:text-gray-200">{course.modules.length}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-gray-500 dark:text-gray-400">Assessments</span><span className="font-semibold text-gray-700 dark:text-gray-200">{courseAssessments.length}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
