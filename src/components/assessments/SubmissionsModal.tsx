"use client";

import { useState } from "react";
import { useAssessmentSubmissions, useGradeSubmission } from "@/hooks/useAssessments";
import { CheckCircle2, Clock, FileText, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function GradeForm({
    assessmentId,
    submissionId,
    totalMarks,
}: {
    assessmentId: string;
    submissionId: string;
    totalMarks: number;
}) {
    const [score, setScore] = useState("");
    const [feedback, setFeedback] = useState("");
    const { mutate: gradeSubmission, isPending, error } = useGradeSubmission();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedScore = Number(score);
        if (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > totalMarks) return;
        gradeSubmission({ id: submissionId, assessmentId, score: parsedScore, feedback });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-3 space-y-2 border-t border-gray-100 pt-3 dark:border-gray-700"
        >
            {error && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                    {error.message}
                </p>
            )}
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    min={0}
                    max={totalMarks}
                    step="0.5"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder={`Score / ${totalMarks}`}
                    aria-label="Score"
                    required
                    className="w-28 rounded-lg border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Feedback (optional)"
                    aria-label="Feedback"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                    type="submit"
                    disabled={isPending || !score}
                    className="bg-navy-800 hover:bg-navy-700 rounded-lg px-4 py-1.5 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-50"
                >
                    {isPending ? "Saving…" : "Save Grade"}
                </button>
            </div>
        </form>
    );
}

export function SubmissionsModal({
    assessmentId,
    onClose,
}: {
    assessmentId: string | null;
    onClose: () => void;
}) {
    const { data, isLoading } = useAssessmentSubmissions(assessmentId);

    return (
        <Dialog open={!!assessmentId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {data?.assessment
                            ? `Submissions — ${data.assessment.title}`
                            : "Submissions"}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 p-5">
                    {isLoading || !data ? (
                        <>
                            <Skeleton className="h-20 w-full rounded-xl" />
                            <Skeleton className="h-20 w-full rounded-xl" />
                        </>
                    ) : data.submissions.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            No students have submitted this assessment yet.
                        </p>
                    ) : (
                        data.submissions.map((s) => (
                            <div
                                key={s.id}
                                className="rounded-xl border border-gray-100 p-4 dark:border-gray-700"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-bold dark:text-white">
                                            {s.user.firstName} {s.user.lastName}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {s.user.matricNumber || "—"}
                                        </p>
                                    </div>
                                    <Badge
                                        pill
                                        variant={
                                            s.status === "GRADED"
                                                ? "success"
                                                : s.status === "LATE"
                                                  ? "destructive"
                                                  : "info"
                                        }
                                        className="text-[10px] uppercase"
                                    >
                                        {s.status === "GRADED" ? (
                                            <CheckCircle2 className="h-3 w-3" />
                                        ) : s.status === "LATE" ? (
                                            <AlertTriangle className="h-3 w-3" />
                                        ) : (
                                            <Clock className="h-3 w-3" />
                                        )}
                                        {s.status === "GRADED"
                                            ? "Graded"
                                            : s.status === "LATE"
                                              ? "Submitted Late"
                                              : "Awaiting Grade"}
                                    </Badge>
                                </div>

                                {s.fileUrl && (
                                    <a
                                        href={s.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        <FileText className="h-3.5 w-3.5" /> View submitted file
                                    </a>
                                )}

                                {s.answers && s.answers.length > 0 && (
                                    <div className="mt-3 space-y-1.5">
                                        {s.answers.map((ans: any, idx: number) => (
                                            <p
                                                key={idx}
                                                className={`text-xs ${ans.isCorrect === false ? "text-red-500" : ans.isCorrect === true ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}`}
                                            >
                                                Q{idx + 1}: {ans.answer}
                                                {ans.isCorrect === true && " ✓"}
                                                {ans.isCorrect === false && " ✗"}
                                            </p>
                                        ))}
                                    </div>
                                )}

                                {s.status === "GRADED" ? (
                                    <p className="mt-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                        Score: {s.score} / {data.assessment.totalMarks}
                                        {s.feedback && (
                                            <span className="ml-2 font-normal text-gray-500 dark:text-gray-400">
                                                — &quot;{s.feedback}&quot;
                                            </span>
                                        )}
                                    </p>
                                ) : (
                                    <GradeForm
                                        assessmentId={assessmentId!}
                                        submissionId={s.id!}
                                        totalMarks={data.assessment.totalMarks}
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
