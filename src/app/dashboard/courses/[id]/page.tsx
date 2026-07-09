"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useCourse, useEnroll } from "@/hooks/useCourses";
import { useAssessments } from "@/hooks/useAssessments";
import { useForumPosts } from "@/hooks/useFeatures";
import { useLogActivity } from "@/hooks/useActivity";
import {
    BookOpen,
    Video,
    FileText,
    Link2,
    Type,
    ChevronDown,
    ChevronRight,
    Circle,
    Clock,
    Users,
    ClipboardList,
    MessageSquare,
    Download,
    Play,
    AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { NewPostModal } from "@/components/forum/NewPostModal";

export default function CourseDetailPage() {
    const { id } = useParams() as { id: string };
    const { data: session } = useAuth();
    const user = session?.user as any;
    const { mutate: logActivity } = useLogActivity();

    const [activeTab, setActiveTab] = useState<"content" | "assessments" | "discussion" | "info">(
        "content"
    );
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const [showNewThread, setShowNewThread] = useState(false);

    const { data: course, isLoading: courseLoading } = useCourse(id);
    const { data: assessments } = useAssessments();
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
            <div className="mx-auto max-w-5xl space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        );
    }

    const courseAssessments = assessments?.filter((a) => a.courseId === course.id) || [];
    const courseForums = forumPosts || [];

    // TODO: Add module completion tracking in DB
    const completedModules = course.modules?.length ? 2 : 0;
    const progress = Math.round((completedModules / (course.modules?.length || 1)) * 100);

    const contentIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "video":
                return <Video className="h-4 w-4 text-red-500" />;
            case "pdf":
                return <FileText className="h-4 w-4 text-red-600" />;
            case "document":
                return <FileText className="h-4 w-4 text-blue-600" />;
            case "link":
                return <Link2 className="h-4 w-4 text-green-600" />;
            case "text":
                return <Type className="h-4 w-4 text-gray-600" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const tabs = [
        { id: "content" as const, label: "Course Content", icon: BookOpen },
        { id: "assessments" as const, label: "Assessments", icon: ClipboardList },
        { id: "discussion" as const, label: "Discussion", icon: MessageSquare },
        { id: "info" as const, label: "Course Info", icon: FileText },
    ];

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Course Header */}
            <div className="from-navy-900 to-navy-700 relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-xl">
                <div className="bg-crimson-400/10 absolute top-0 right-0 h-48 w-48 translate-x-1/4 -translate-y-1/4 rounded-full blur-2xl" />
                <div className="relative z-10">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-bold shadow-sm">
                                {course.code}
                            </span>
                            <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-medium capitalize shadow-sm">
                                {course.semester} Semester
                            </span>
                            <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-medium shadow-sm">
                                {course.level} Level
                            </span>
                        </div>
                    </div>
                    <h1 className="mt-2 text-2xl font-bold">{course.title}</h1>
                    <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-blue-100">
                        {course.description}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center justify-between">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                            <span className="flex items-center gap-1 font-medium">
                                <Users className="h-4 w-4" /> {course._count?.enrollments || 0}{" "}
                                students
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                                <BookOpen className="h-4 w-4" /> {course.modules.length} modules
                            </span>
                            <span className="font-medium">
                                Lecturer:{" "}
                                <strong className="text-white">
                                    {course.instructor?.firstName} {course.instructor?.lastName}
                                </strong>
                            </span>
                        </div>

                        {user?.role === "STUDENT" && !course.isEnrolled && (
                            <button
                                onClick={() => enroll(course.id)}
                                disabled={enrollPending}
                                className="rounded-xl bg-emerald-500 px-6 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-600 disabled:opacity-50"
                            >
                                {enrollPending ? "Enrolling..." : "Enroll in Course"}
                            </button>
                        )}
                    </div>

                    {user?.role === "STUDENT" && course.isEnrolled && (
                        <div className="mt-6 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                            <div className="mb-1.5 flex justify-between text-xs">
                                <span className="font-medium text-blue-100">Your Progress</span>
                                <span className="font-bold">{progress}%</span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/20">
                                <div
                                    className="h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-1000"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!course.isEnrolled && user?.role === "STUDENT" && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium">
                        You need to enroll in this course to access modules, submit assessments, and
                        participate in discussions.
                    </p>
                </div>
            )}

            {/* Tabs */}
            <div
                className={`rounded-xl border border-gray-100 bg-white shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 ${!course.isEnrolled && user?.role === "STUDENT" ? "pointer-events-none opacity-60" : ""}`}
            >
                <div className="hide-scrollbar flex overflow-x-auto border-b border-gray-100 dark:border-gray-700">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all ${
                                activeTab === tab.id
                                    ? "border-blue-600 bg-blue-50/50 text-blue-600 dark:border-blue-400 dark:bg-gray-700/50 dark:text-blue-400"
                                    : "transform-colors border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                            }`}
                        >
                            <tab.icon className="h-4 w-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    {/* Content Tab */}
                    {activeTab === "content" && (
                        <div className="space-y-3">
                            {course.modules.length === 0 ? (
                                <p className="py-8 text-center text-sm text-gray-500">
                                    No modules have been added to this course yet.
                                </p>
                            ) : (
                                course.modules.map((mod: any) => (
                                    <div
                                        key={mod.id}
                                        className="overflow-hidden rounded-xl border border-gray-100 transition-all hover:border-blue-200 dark:border-gray-700 dark:hover:border-blue-500/30"
                                    >
                                        <button
                                            onClick={() =>
                                                setExpandedModule(
                                                    expandedModule === mod.id ? null : mod.id
                                                )
                                            }
                                            className="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Placeholder for completion tracking */}
                                                <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                                                <div className="text-left">
                                                    <p className="text-sm font-semibold dark:text-white">
                                                        Module {mod.order}: {mod.title}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                                        {mod.description ||
                                                            "No description provided."}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800">
                                                    {mod.contents?.length || 0} items
                                                </span>
                                                {expandedModule === mod.id ? (
                                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                                )}
                                            </div>
                                        </button>
                                        {expandedModule === mod.id &&
                                            mod.contents &&
                                            mod.contents.length > 0 && (
                                                <div className="space-y-2 border-t border-gray-100 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                                                    {mod.contents.map((content: any) => (
                                                        <a
                                                            key={content.id}
                                                            href={content.url || "#"}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="group flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 transition-all hover:border-blue-200 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500/50"
                                                        >
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 transition-colors group-hover:bg-blue-50 dark:bg-gray-700 dark:group-hover:bg-blue-900/30">
                                                                {contentIcon(content.type)}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium transition-colors group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400">
                                                                    {content.title}
                                                                </p>
                                                                <p className="mt-0.5 text-xs text-gray-500 capitalize dark:text-gray-400">
                                                                    {content.type.toLowerCase()} •
                                                                    Included content
                                                                </p>
                                                            </div>
                                                            {content.type.toLowerCase() ===
                                                            "video" ? (
                                                                <Play className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                                                            ) : (
                                                                <Download className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
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
                                <p className="py-8 text-center text-sm text-gray-500">
                                    No assessments found for this course.
                                </p>
                            ) : (
                                courseAssessments.map((a) => (
                                    <div
                                        key={a.id}
                                        className="group flex flex-col gap-4 rounded-xl border border-gray-100 p-4 transition-colors hover:border-blue-200 sm:flex-row sm:items-center dark:border-gray-700 dark:hover:border-blue-500/50"
                                    >
                                        <div
                                            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${a.type.toLowerCase() === "quiz" ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`}
                                        >
                                            <ClipboardList className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                                {a.title}
                                            </p>
                                            <p className="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                                                {a.description || "No specific instructions."}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2 text-[10px] sm:text-xs">
                                                <span className="rounded bg-gray-100 px-2 py-0.5 font-medium capitalize dark:bg-gray-700 dark:text-gray-300">
                                                    {a.type.toLowerCase()}
                                                </span>
                                                <span className="rounded bg-gray-100 px-2 py-0.5 font-medium dark:bg-gray-700 dark:text-gray-300">
                                                    {a.totalMarks} points
                                                </span>
                                                {a.duration && (
                                                    <span className="rounded bg-gray-100 px-2 py-0.5 font-medium dark:bg-gray-700 dark:text-gray-300">
                                                        {a.duration} min timer
                                                    </span>
                                                )}
                                            </div>

                                            {(() => {
                                                const mySubmission = (a as any).submissions?.find(
                                                    (s: any) => s.userId === user?.id
                                                );
                                                if (!mySubmission) return null;
                                                return (
                                                    <div
                                                        className={`mt-3 flex items-center gap-2 rounded-lg border p-2.5 text-xs ${mySubmission.status === "GRADED" ? "border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/20" : "border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/20"}`}
                                                    >
                                                        {mySubmission.status === "GRADED" ? (
                                                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                                                Graded: {mySubmission.score} /{" "}
                                                                {a.totalMarks} (
                                                                {Math.round(
                                                                    (mySubmission.score /
                                                                        a.totalMarks) *
                                                                        100
                                                                )}
                                                                %)
                                                                {mySubmission.feedback &&
                                                                    ` — "${mySubmission.feedback}"`}
                                                            </span>
                                                        ) : (
                                                            <span className="font-bold text-blue-700 dark:text-blue-400">
                                                                Submitted — awaiting grade
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <div className="mt-2 flex flex-row items-center justify-between gap-2 border-t border-gray-100 pt-2 sm:mt-0 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:pt-0 dark:border-gray-700">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase sm:text-xs ${a.isPublished ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}
                                            >
                                                {a.isPublished ? "Active" : "Draft"}
                                            </span>
                                            <p className="flex items-center gap-1 text-[10px] font-medium text-gray-500 sm:text-xs dark:text-gray-400">
                                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                Due:{" "}
                                                {a.dueDate
                                                    ? new Date(a.dueDate).toLocaleDateString(
                                                          "en-NG",
                                                          {
                                                              month: "short",
                                                              day: "numeric",
                                                              year: "numeric",
                                                          }
                                                      )
                                                    : "Not set"}
                                            </p>
                                            {(a.questions?.length ?? 0) > 0 && (
                                                <a
                                                    href="/dashboard/assessments"
                                                    className="text-[10px] font-bold text-blue-600 hover:underline sm:text-xs dark:text-blue-400"
                                                >
                                                    View in Assessments →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Discussion Tab */}
                    {activeTab === "discussion" && (
                        <div className="space-y-4">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {course.semester === "First"
                                        ? "🔒 Archived — this semester's discussions are closed"
                                        : "Join the course conversation"}
                                </p>
                                {course.semester !== "First" && (
                                    <button
                                        onClick={() => setShowNewThread(true)}
                                        className="scale-active-95 bg-navy-800 hover:bg-navy-700 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition-all"
                                    >
                                        <MessageSquare className="h-4 w-4" /> New Thread
                                    </button>
                                )}
                            </div>

                            {forumLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-32 w-full rounded-xl" />
                                    <Skeleton className="h-32 w-full rounded-xl" />
                                </div>
                            ) : courseForums.length === 0 ? (
                                <div className="rounded-xl border border-gray-100 bg-gray-50 py-10 text-center dark:border-gray-700 dark:bg-gray-800/50">
                                    <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                                    <p className="text-sm font-medium text-gray-500">
                                        No discussions posted yet.
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Be the first to start a conversation!
                                    </p>
                                </div>
                            ) : (
                                courseForums.map((post: any) => (
                                    <div
                                        key={post.id}
                                        className={`rounded-xl border p-4 transition-all hover:shadow-md ${post.isPinned ? "border-amber-200 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-900/20" : "border-gray-100 hover:border-gray-200 dark:border-gray-700 dark:hover:border-gray-600"}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${post.author.role === "LECTURER" ? "bg-blue-500" : "bg-emerald-500"}`}
                                            >
                                                {post.author.firstName?.[0] || ""}
                                                {post.author.lastName?.[0] || "U"}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-bold dark:text-white">
                                                        {post.author.firstName}{" "}
                                                        {post.author.lastName}
                                                    </span>
                                                    <span
                                                        className={`rounded px-2 py-0.5 text-[10px] font-semibold capitalize ${post.author.role === "LECTURER" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"}`}
                                                    >
                                                        {post.author.role.toLowerCase()}
                                                    </span>
                                                    {post.isPinned && (
                                                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                                                            📌 Pinned
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="mt-2 text-base font-bold text-gray-900 dark:text-white">
                                                    {post.title}
                                                </h4>
                                                <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-gray-600 dark:text-gray-300">
                                                    {post.body}
                                                </p>

                                                <div className="mt-4 flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    <span className="flex cursor-pointer items-center gap-1 transition-colors hover:text-blue-600">
                                                        <MessageSquare className="h-3.5 w-3.5" />{" "}
                                                        {post._count?.replies || 0} replies
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />{" "}
                                                        {new Date(
                                                            post.createdAt
                                                        ).toLocaleDateString("en-NG")}
                                                    </span>
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
                        <div className="animate-fade-in-up space-y-6">
                            <div>
                                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                                    About this Course
                                </h3>
                                <p className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-300">
                                    {course.description}
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                                    <h4 className="mb-4 flex items-center gap-2 text-sm font-bold dark:text-white">
                                        <BookOpen className="h-4 w-4 text-blue-500" /> Academic
                                        Details
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2 dark:border-gray-700/50">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Course Code
                                            </span>
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                {course.code}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2 dark:border-gray-700/50">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Level
                                            </span>
                                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                                {course.level} Level
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2 dark:border-gray-700/50">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Semester
                                            </span>
                                            <span className="font-semibold text-gray-700 capitalize dark:text-gray-200">
                                                {course.semester}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2 dark:border-gray-700/50">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Credits
                                            </span>
                                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                                {course.unit} Unit{course.unit === 1 ? "" : "s"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Status
                                            </span>
                                            {course.semester === "First" ? (
                                                <span className="rounded bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600 capitalize dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className="rounded bg-blue-50 px-2 py-0.5 font-semibold text-blue-600 capitalize dark:bg-blue-900/30 dark:text-blue-400">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                                    <h4 className="mb-4 flex items-center gap-2 text-sm font-bold dark:text-white">
                                        <Users className="h-4 w-4 text-emerald-500" /> Enrollment
                                        Stats
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2 dark:border-gray-700/50">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Enrolled Students
                                            </span>
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                {course._count?.enrollments || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2 dark:border-gray-700/50">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Max Capacity
                                            </span>
                                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                                Unlimited
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2 dark:border-gray-700/50">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Course Instructor
                                            </span>
                                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                                {course.instructor?.firstName}{" "}
                                                {course.instructor?.lastName}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2 dark:border-gray-700/50">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Total Modules
                                            </span>
                                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                                {course.modules.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Assessments
                                            </span>
                                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                                {courseAssessments.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <NewPostModal
                open={showNewThread}
                onClose={() => setShowNewThread(false)}
                defaultCourseId={course.id}
                lockCourse
            />
        </div>
    );
}
