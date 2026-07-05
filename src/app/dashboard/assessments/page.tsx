"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useAssessments, useSubmitAssessment } from "@/hooks/useAssessments";
import { ClipboardList, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AssessmentsPage() {
    const { data: session } = useAuth();
    const user = session?.user as any;
    const { data: assessments, isLoading } = useAssessments();
    const { mutate: submitAssessment, isPending: submitting } = useSubmitAssessment();

    const [filter, setFilter] = useState<string>("all");
    const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number | string>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);

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

    // Handle local filtering states
    const filtered =
        filter === "all"
            ? assessments
            : assessments.filter((a) => {
                  if (filter === "active") return a.isPublished;
                  if (filter === "draft") return !a.isPublished;
                  return true;
              });
    const activeQuiz = assessments.find((a) => a.id === selectedQuiz);

    const handleQuizSubmit = () => {
        if (!activeQuiz) return;

        // Structure the submission for the Prisma backend
        // `quizAnswers` maps QuestionId -> AnswerValue
        const submissionData = {
            answers: Object.entries(quizAnswers).map(([questionId, value]) => ({
                questionId,
                value: value.toString(),
            })),
        };

        submitAssessment(
            { id: activeQuiz.id, submission: submissionData },
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
                                {activeQuiz.timeLimit} minutes
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Assessments</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {assessments.length} total assessments available
                    </p>
                </div>
                {user?.role !== "STUDENT" && (
                    <button className="bg-navy-800 hover:bg-navy-700 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg">
                        <ClipboardList className="h-4 w-4" /> Create Assessment
                    </button>
                )}
            </div>

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
                        // Check if student has a submission for this assessment
                        const sub = a.submissions?.find((s: any) => s.studentId === user?.id);

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
                                                    sub?.status === "graded"
                                                        ? "success"
                                                        : a.isPublished && !sub
                                                          ? "info"
                                                          : !a.isPublished
                                                            ? "secondary"
                                                            : "warning"
                                                }
                                                className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                                            >
                                                {sub?.status === "graded"
                                                    ? "Graded"
                                                    : sub
                                                      ? "Submitted"
                                                      : a.isPublished
                                                        ? "Active"
                                                        : "Draft"}
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
                                            {a.timeLimit && (
                                                <span className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-0.5 dark:border-gray-600">
                                                    <Clock className="h-3 w-3" /> {a.timeLimit} min
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 rounded-md border border-red-100 px-2 py-0.5 text-red-600 dark:border-red-900/30 dark:text-red-400">
                                                <Clock className="h-3 w-3" /> Due{" "}
                                                {new Date(a.dueDate).toLocaleDateString("en-NG")}
                                            </span>
                                        </div>

                                        {sub && (
                                            <div
                                                className={`mt-4 flex items-center gap-2 rounded-xl border p-3 text-xs ${sub.status === "graded" ? "border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/20" : "border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/20"}`}
                                            >
                                                {sub.status === "graded" ? (
                                                    <>
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                                            Graded: {sub.score} / {a.totalMarks} (
                                                            {Math.round(
                                                                (sub.score! / a.totalMarks) * 100
                                                            )}
                                                            %)
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

                                    <div className="mt-4 flex w-full items-center justify-between border-t border-gray-100 pt-4 sm:mt-0 sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:pt-0 dark:border-gray-700">
                                        {a.type.toLowerCase() === "quiz" &&
                                            a.isPublished &&
                                            (a.questions?.length ?? 0) > 0 &&
                                            user?.role === "STUDENT" &&
                                            !sub && (
                                                <button
                                                    onClick={() => setSelectedQuiz(a.id)}
                                                    className="bg-navy-800 hover:bg-navy-700 flex w-full items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
                                                >
                                                    Start Quiz <ChevronRight className="h-4 w-4" />
                                                </button>
                                            )}
                                        {a.type.toLowerCase() === "assignment" &&
                                            a.isPublished &&
                                            user?.role === "STUDENT" &&
                                            !sub && (
                                                <button className="bg-navy-800 hover:bg-navy-700 w-full rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg sm:w-auto">
                                                    Upload Work
                                                </button>
                                            )}
                                        {user?.role !== "STUDENT" && (
                                            <button className="w-full rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200 sm:w-auto dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                                View Submissions
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
