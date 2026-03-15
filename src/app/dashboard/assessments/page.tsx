"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useAssessments, useSubmitAssessment } from "@/hooks/useAssessments";
import { ClipboardList, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
            <div className="max-w-5xl mx-auto space-y-6">
                <Skeleton className="h-12 w-1/3" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" /><Skeleton className="h-10 w-24" />
                </div>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    // Handle local filtering states
    const filtered = filter === "all" ? assessments : assessments.filter(a => {
        if (filter === "active") return a.isPublished;
        if (filter === "draft") return !a.isPublished;
        return true;
    });
    const activeQuiz = assessments.find(a => a.id === selectedQuiz);

    const handleQuizSubmit = () => {
        if (!activeQuiz) return;

        // Structure the submission for the Prisma backend
        // `quizAnswers` maps QuestionId -> AnswerValue
        const submissionData = {
            answers: Object.entries(quizAnswers).map(([questionId, value]) => ({
                questionId,
                value: value.toString()
            }))
        };

        submitAssessment({ id: activeQuiz.id, submission: submissionData }, {
            onSuccess: () => {
                setQuizSubmitted(true);
            }
        });
    };

    // ------------------------------------------------------------------------
    // ACTIVE QUIZ VIEW
    // ------------------------------------------------------------------------
    if (selectedQuiz && activeQuiz?.questions) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div>
                            <h2 className="text-xl font-bold dark:text-white">{activeQuiz.title}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {activeQuiz.course?.code} • {activeQuiz.totalMarks} points • {activeQuiz.timeLimit} minutes
                            </p>
                        </div>
                        <button
                            onClick={() => { setSelectedQuiz(null); setQuizSubmitted(false); setQuizAnswers({}); }}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    {quizSubmitted ? (
                        <div className="text-center py-8 animate-fade-in-up">
                            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">Quiz Submitted Successfully!</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Your answers have been recorded and auto-graded. Check your gradebook for results.</p>
                            <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 inline-block border border-emerald-100 dark:border-emerald-900/30">
                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                    Answered: {Object.keys(quizAnswers).length} / {activeQuiz.questions.length} questions
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in-up">
                            {activeQuiz.questions.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">This quiz has no questions attached.</p>
                            ) : (
                                activeQuiz.questions.map((q, idx) => (
                                    <div key={q.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-5 bg-gray-50/50 dark:bg-gray-800/30">
                                        <div className="flex items-start gap-3 mb-4">
                                            <span className="w-7 h-7 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300 shadow-sm shrink-0">{idx + 1}</span>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm md:text-base dark:text-white leading-relaxed">{q.text}</p>
                                                <span className="inline-block mt-2 text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow-sm border border-gray-100 dark:border-gray-700">
                                                    {q.marks} points • {q.type.replace("_", "/")}
                                                </span>
                                            </div>
                                        </div>

                                        {q.type.toLowerCase() === "multiple_choice" || q.type.toLowerCase() === "true_false" ? (
                                            <div className="ml-10 space-y-2">
                                                {q.options?.map((opt, oi) => (
                                                    <label key={oi} className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${quizAnswers[q.id] === String(oi) ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20 shadow-sm" : "border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800"}`}>
                                                        <input
                                                            type="radio"
                                                            name={q.id}
                                                            checked={quizAnswers[q.id] === String(oi)}
                                                            onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: String(oi) })}
                                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="ml-10">
                                                <textarea
                                                    value={(quizAnswers[q.id] as string) || ""}
                                                    onChange={e => setQuizAnswers({ ...quizAnswers, [q.id]: e.target.value })}
                                                    className="w-full p-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                                                    rows={4}
                                                    placeholder="Type your detailed answer here..."
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={handleQuizSubmit}
                                    disabled={submitting}
                                    className="w-full bg-blue-900 text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {submitting ? "Submitting..." : "Submit Answers"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------------------
    // ASSESSMENTS LIST VIEW
    // ------------------------------------------------------------------------
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Assessments</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{assessments.length} total assessments available</p>
                </div>
                {user?.role !== "STUDENT" && (
                    <button className="bg-blue-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 flex items-center gap-2 shadow-md transition-all hover:shadow-lg">
                        <ClipboardList className="w-4 h-4" /> Create Assessment
                    </button>
                )}
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {["all", "active", "upcoming", "graded", "closed"].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${filter === f ? "bg-blue-900 text-white scale-105" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                    >
                        {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Assessment List */}
            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <ClipboardList className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No assessments found matching the criteria.</p>
                    </div>
                ) : (
                    filtered.map(a => {
                        // Check if student has a submission for this assessment
                        const sub = a.submissions?.find((s: any) => s.studentId === user?.id);

                        return (
                            <div key={a.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-5 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-md transition-all group">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${a.type.toLowerCase() === "quiz" ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : a.type.toLowerCase() === "assignment" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                                        <ClipboardList className="w-6 h-6" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                            <h3 className="font-bold text-base dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{a.title}</h3>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase ${sub?.status === "graded" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                                a.isPublished && !sub ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                                    !a.isPublished ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400" : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                }`}>
                                                {sub?.status === "graded" ? "Graded" : sub ? "Submitted" : a.isPublished ? "Active" : "Draft"}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{a.description || "No distinct instructions."}</p>

                                        <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
                                            <span className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md shadow-sm">{a.course?.code}</span>
                                            <span className="capitalize border border-gray-200 dark:border-gray-600 px-2 py-0.5 rounded-md">{a.type.toLowerCase()}</span>
                                            <span className="border border-gray-200 dark:border-gray-600 px-2 py-0.5 rounded-md">{a.totalMarks} marks</span>
                                            {a.timeLimit && <span className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 px-2 py-0.5 rounded-md"><Clock className="w-3 h-3" /> {a.timeLimit} min</span>}
                                            <span className="flex items-center gap-1 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-md"><Clock className="w-3 h-3" /> Due {new Date(a.dueDate).toLocaleDateString("en-NG")}</span>
                                        </div>

                                        {sub && (
                                            <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${sub.status === "graded" ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30" : "bg-blue-50/50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30"}`}>
                                                {sub.status === "graded" ? (
                                                    <>
                                                        <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/50 rounded-md flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-4 h-4" /></div>
                                                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">Graded: {sub.score} / {a.totalMarks} ({Math.round((sub.score! / a.totalMarks) * 100)}%)</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-md flex items-center justify-center text-blue-600"><Clock className="w-4 h-4" /></div>
                                                        <span className="text-blue-700 dark:text-blue-400 font-bold">Awaiting Grade</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
                                        {a.type.toLowerCase() === "quiz" && a.isPublished && (a.questions?.length ?? 0) > 0 && user?.role === "STUDENT" && !sub && (
                                            <button
                                                onClick={() => setSelectedQuiz(a.id)}
                                                className="w-full sm:w-auto bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-blue-800 flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                Start Quiz <ChevronRight className="w-4 h-4" />
                                            </button>
                                        )}
                                        {a.type.toLowerCase() === "assignment" && a.isPublished && user?.role === "STUDENT" && !sub && (
                                            <button className="w-full sm:w-auto bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-blue-800 transition-all">
                                                Upload Work
                                            </button>
                                        )}
                                        {user?.role !== "STUDENT" && (
                                            <button className="w-full sm:w-auto bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                                View Submissions
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
