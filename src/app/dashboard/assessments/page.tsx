"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
    useAssessments,
    useSubmitAssessment,
    type AssessmentWithDetails,
} from "@/hooks/useAssessments";
import {
    ClipboardList,
    Clock,
    CheckCircle2,
    ChevronRight,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubmissionsModal } from "@/components/assessments/SubmissionsModal";

// A single source of truth for what tab an assessment belongs in, so the
// filter pills, the status badge, and the "can the student still act on
// this" gating all agree with each other instead of drifting independently.
type AssessmentBucket = "upcoming" | "active" | "graded" | "closed";

function getStudentBucket(a: AssessmentWithDetails, userId?: string): AssessmentBucket {
    if (!a.isPublished) return "upcoming";
    const mySub = a.submissions?.find((s: any) => s.userId === userId);
    if (mySub?.status === "GRADED") return "graded";
    if (mySub) return "closed"; // submitted (on time or late), awaiting grade
    const overdue = a.dueDate ? new Date(a.dueDate) < new Date() : false;
    return overdue ? "closed" : "active"; // missed, or still open to submit
}

function getStaffBucket(a: AssessmentWithDetails): AssessmentBucket {
    if (!a.isPublished) return "upcoming";
    const subs = (a.submissions as any[]) || [];
    const pending = subs.filter((s) => s.status === "SUBMITTED" || s.status === "LATE").length;
    if (subs.length > 0 && pending === 0) return "graded"; // fully marked
    const overdue = a.dueDate ? new Date(a.dueDate) < new Date() : false;
    return overdue ? "closed" : "active";
}

export default function AssessmentsPage() {
    const { data: session } = useAuth();
    const user = session?.user as any;
    const { data: assessments, isLoading } = useAssessments();
    const { mutate: submitAssessment, isPending: submitting } = useSubmitAssessment();

    const [filter, setFilter] = useState<string>("all");
    const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number | string>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState<string | null>(null);

    // Assignment file upload — real files go to Supabase storage via /api/upload,
    // then the resulting URL is attached to the submission.
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleUploadClick = (assessmentId: string) => {
        setUploadTargetId(assessmentId);
        setUploadError(null);
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const assessmentId = uploadTargetId;
        e.target.value = ""; // allow re-selecting the same file later
        if (!file || !assessmentId) return;

        setUploading(true);
        setUploadError(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
            if (!uploadRes.ok) {
                const err = await uploadRes.json();
                throw new Error(err.message || "Upload failed");
            }
            const { url } = await uploadRes.json();

            submitAssessment(
                { id: assessmentId, submission: { fileUrl: url } },
                {
                    onError: (err: Error) => setUploadError(err.message),
                }
            );
        } catch (err: any) {
            setUploadError(err.message || "Upload failed");
        } finally {
            setUploading(false);
            setUploadTargetId(null);
        }
    };

    if (isLoading || !assessments) {
        return (
            <div className="mx-auto max-w-5xl space-y-6">
                <Skeleton className="h-12 w-1/3" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    // Each tab pill maps to a bucket computed by getStudentBucket/getStaffBucket
    // — previously "active" only checked isPublished (true for nearly every
    // assessment) and "upcoming"/"graded"/"closed" fell through to a bare
    // `return true`, so every tab except "all" showed either everything or
    // nothing, and already-graded work never reliably landed under Graded.
    const isStudent = user?.role === "STUDENT";
    const filtered =
        filter === "all"
            ? assessments
            : assessments.filter((a) => {
                  const bucket = isStudent ? getStudentBucket(a, user?.id) : getStaffBucket(a);
                  return bucket === filter;
              });
    const activeQuiz = assessments.find((a) => a.id === selectedQuiz);

    const handleQuizSubmit = () => {
        if (!activeQuiz) return;

        // `quizAnswers` is already a Record<questionId, answer> — the API
        // expects exactly that shape. It was previously being flattened into
        // an array of {questionId, value} objects here, which silently broke
        // every quiz's auto-grading (answers[question.id] was always
        // undefined server-side, so every question scored 0).
        const answers: Record<string, string> = {};
        Object.entries(quizAnswers).forEach(([questionId, value]) => {
            answers[questionId] = String(value);
        });

        submitAssessment(
            { id: activeQuiz.id, submission: { answers } },
            {
                onSuccess: () => {
                    setQuizSubmitted(true);
                },
            }
        );
    };

    // ------------------------------------------------------------------------
    // ACTIVE QUIZ VIEW
    // ------------------------------------------------------------------------
    if (selectedQuiz && activeQuiz?.questions) {
        return (
            <div className="mx-auto max-w-3xl space-y-6">
                <Card className="rounded-xl p-6">
                    <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-700">
                        <div>
                            <h2 className="text-xl font-bold dark:text-white">
                                {activeQuiz.title}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {activeQuiz.course?.code} • {activeQuiz.totalMarks} points •{" "}
                                {activeQuiz.duration} minutes
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedQuiz(null);
                                setQuizSubmitted(false);
                                setQuizAnswers({});
                            }}
                            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </div>

                    {quizSubmitted ? (
                        <div className="animate-fade-in-up py-8 text-center">
                            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
                            <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                                Quiz Submitted Successfully!
                            </h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                Your answers have been recorded and auto-graded. Check your
                                gradebook for results.
                            </p>
                            <div className="mt-6 inline-block rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/30 dark:bg-emerald-900/20">
                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                    Answered: {Object.keys(quizAnswers).length} /{" "}
                                    {activeQuiz.questions.length} questions
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in-up space-y-6">
                            {activeQuiz.questions.length === 0 ? (
                                <p className="py-8 text-center text-sm text-gray-500">
                                    This quiz has no questions attached.
                                </p>
                            ) : (
                                activeQuiz.questions.map((q, idx) => (
                                    <div
                                        key={q.id}
                                        className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/30"
                                    >
                                        <div className="mb-4 flex items-start gap-3">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 shadow-sm dark:bg-blue-900/50 dark:text-blue-300">
                                                {idx + 1}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-sm leading-relaxed font-medium md:text-base dark:text-white">
                                                    {q.text}
                                                </p>
                                                <span className="mt-2 inline-block rounded border border-gray-100 bg-white px-2 py-0.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                                    {q.marks} points • {q.type.replace("_", "/")}
                                                </span>
                                            </div>
                                        </div>

                                        {q.type.toLowerCase() === "multiple_choice" ||
                                        q.type.toLowerCase() === "true_false" ? (
                                            <div className="ml-10 space-y-2">
                                                {q.options?.map((opt, oi) => (
                                                    <label
                                                        key={oi}
                                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-all ${quizAnswers[q.id] === String(oi) ? "border-blue-400 bg-blue-50 shadow-sm dark:border-blue-500 dark:bg-blue-900/20" : "border-gray-200 bg-white hover:bg-white dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50"}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={q.id}
                                                            checked={
                                                                quizAnswers[q.id] === String(oi)
                                                            }
                                                            onChange={() =>
                                                                setQuizAnswers({
                                                                    ...quizAnswers,
                                                                    [q.id]: String(oi),
                                                                })
                                                            }
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                            {opt}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="ml-10">
                                                <textarea
                                                    aria-label={`Answer for question ${idx + 1}`}
                                                    value={(quizAnswers[q.id] as string) || ""}
                                                    onChange={(e) =>
                                                        setQuizAnswers({
                                                            ...quizAnswers,
                                                            [q.id]: e.target.value,
                                                        })
                                                    }
                                                    className="w-full rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                    rows={4}
                                                    placeholder="Type your detailed answer here..."
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}

                            <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
                                <button
                                    onClick={handleQuizSubmit}
                                    disabled={submitting}
                                    className="bg-navy-800 hover:bg-navy-700 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white shadow-md transition-colors disabled:opacity-50"
                                >
                                    {submitting ? "Submitting..." : "Submit Answers"}
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        );
    }

    // ------------------------------------------------------------------------
    // ASSESSMENTS LIST VIEW
    // ------------------------------------------------------------------------
    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelected}
                aria-label="Upload assignment file"
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Assessments</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {assessments.length} total assessments available
                    </p>
                </div>
                {user?.role !== "STUDENT" && (
                    <button
                        title="Coming soon"
                        className="bg-navy-800 hover:bg-navy-700 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white opacity-60 shadow-md transition-all"
                        disabled
                    >
                        <ClipboardList className="h-4 w-4" /> Create Assessment
                    </button>
                )}
            </div>

            <SubmissionsModal
                assessmentId={viewingSubmissionsFor}
                onClose={() => setViewingSubmissionsFor(null)}
            />

            {uploadError && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {uploadError}
                </p>
            )}

            {/* Filter Pills */}
            <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
                {["all", "active", "upcoming", "graded", "closed"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap shadow-sm transition-all ${filter === f ? "bg-navy-800 scale-105 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
                    >
                        {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Assessment List */}
            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <Card className="rounded-xl py-10 text-center">
                        <ClipboardList className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                        <p className="font-medium text-gray-500 dark:text-gray-400">
                            No assessments found matching the criteria.
                        </p>
                    </Card>
                ) : (
                    filtered.map((a) => {
                        // Bug: this used to compare `s.studentId`, a field that
                        // doesn't exist on Submission (it's `userId`) — mySub
                        // was always undefined, which is why graded/submitted
                        // work always looked "Active" and Start Quiz/Upload
                        // Work never disabled themselves after submitting.
                        const mySub = isStudent
                            ? a.submissions?.find((s: any) => s.userId === user?.id)
                            : undefined;
                        const bucket = isStudent
                            ? getStudentBucket(a, user?.id)
                            : getStaffBucket(a);
                        const overdue = a.dueDate ? new Date(a.dueDate) < new Date() : false;

                        return (
                            <Card
                                key={a.id}
                                className="group rounded-xl p-4 transition-all hover:border-blue-200 hover:shadow-md sm:p-5 dark:hover:border-blue-500/50"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                    <div
                                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl shadow-sm ${a.type.toLowerCase() === "quiz" ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : a.type.toLowerCase() === "assignment" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"}`}
                                    >
                                        <ClipboardList className="h-6 w-6" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                            <h3 className="text-base font-bold transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                                {a.title}
                                            </h3>
                                            <Badge
                                                pill
                                                variant={
                                                    bucket === "graded"
                                                        ? "success"
                                                        : bucket === "active"
                                                          ? "info"
                                                          : bucket === "upcoming"
                                                            ? "secondary"
                                                            : "warning"
                                                }
                                                className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                                            >
                                                {bucket === "graded"
                                                    ? "Graded"
                                                    : bucket === "active"
                                                      ? "Active"
                                                      : bucket === "upcoming"
                                                        ? "Draft"
                                                        : isStudent
                                                          ? mySub
                                                              ? "Awaiting Grade"
                                                              : "Missed"
                                                          : "Closed"}
                                            </Badge>
                                        </div>

                                        <p className="line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                            {a.description || "No distinct instructions."}
                                        </p>

                                        <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-medium text-gray-500 sm:text-xs dark:text-gray-400">
                                            <span className="rounded-md bg-gray-100 px-2.5 py-1 shadow-sm dark:bg-gray-700 dark:text-gray-300">
                                                {a.course?.code}
                                            </span>
                                            <span className="rounded-md border border-gray-200 px-2 py-0.5 capitalize dark:border-gray-600">
                                                {a.type.toLowerCase()}
                                            </span>
                                            <span className="rounded-md border border-gray-200 px-2 py-0.5 dark:border-gray-600">
                                                {a.totalMarks} marks
                                            </span>
                                            {a.duration && (
                                                <span className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-0.5 dark:border-gray-600">
                                                    <Clock className="h-3 w-3" /> {a.duration} min
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 rounded-md border border-red-100 px-2 py-0.5 text-red-600 dark:border-red-900/30 dark:text-red-400">
                                                <Clock className="h-3 w-3" /> Due{" "}
                                                {a.dueDate
                                                    ? new Date(a.dueDate).toLocaleDateString(
                                                          "en-NG"
                                                      )
                                                    : "Not set"}
                                            </span>
                                        </div>

                                        {mySub && (
                                            <div
                                                className={`mt-4 flex items-center gap-2 rounded-xl border p-3 text-xs ${mySub.status === "GRADED" ? "border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/20" : mySub.status === "LATE" ? "border-amber-100 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/20" : "border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/20"}`}
                                            >
                                                {mySub.status === "GRADED" ? (
                                                    <>
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                                            Graded: {mySub.score} / {a.totalMarks} (
                                                            {Math.round(
                                                                (mySub.score! / a.totalMarks) * 100
                                                            )}
                                                            %)
                                                        </span>
                                                    </>
                                                ) : mySub.status === "LATE" ? (
                                                    <>
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-600 dark:bg-amber-900/50">
                                                            <AlertTriangle className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-bold text-amber-700 dark:text-amber-400">
                                                            Submitted Late — Awaiting Grade
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900/50">
                                                            <Clock className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-bold text-blue-700 dark:text-blue-400">
                                                            Awaiting Grade
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex w-full flex-col items-end gap-1.5 border-t border-gray-100 pt-4 sm:mt-0 sm:w-auto sm:border-t-0 sm:pt-0 dark:border-gray-700">
                                        {a.type.toLowerCase() === "quiz" &&
                                            a.isPublished &&
                                            (a.questions?.length ?? 0) > 0 &&
                                            isStudent &&
                                            !mySub && (
                                                <>
                                                    <button
                                                        onClick={() => setSelectedQuiz(a.id)}
                                                        className="bg-navy-800 hover:bg-navy-700 flex w-full items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
                                                    >
                                                        Start Quiz{" "}
                                                        <ChevronRight className="h-4 w-4" />
                                                    </button>
                                                    {overdue && (
                                                        <span className="flex items-center gap-1 text-[10px] font-medium text-red-500">
                                                            <AlertTriangle className="h-3 w-3" />{" "}
                                                            Past due — will be marked late
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        {a.type.toLowerCase() === "assignment" &&
                                            a.isPublished &&
                                            isStudent &&
                                            !mySub && (
                                                <>
                                                    <button
                                                        onClick={() => handleUploadClick(a.id)}
                                                        disabled={
                                                            uploading && uploadTargetId === a.id
                                                        }
                                                        className="bg-navy-800 hover:bg-navy-700 flex w-full items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 sm:w-auto"
                                                    >
                                                        {uploading && uploadTargetId === a.id ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                Uploading…
                                                            </>
                                                        ) : (
                                                            "Upload Work"
                                                        )}
                                                    </button>
                                                    {overdue && (
                                                        <span className="flex items-center gap-1 text-[10px] font-medium text-red-500">
                                                            <AlertTriangle className="h-3 w-3" />{" "}
                                                            Past due — will be marked late
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        {!isStudent && (
                                            <button
                                                onClick={() => setViewingSubmissionsFor(a.id)}
                                                className="w-full rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200 sm:w-auto dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                            >
                                                View Submissions ({a._count?.submissions ?? 0})
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
