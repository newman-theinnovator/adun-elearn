import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Submission {
    // Present on every submission; the only field guaranteed on the
    // lightweight { status } shape the lecturer/admin assessment list uses.
    status: string;
    // Only present on the student's own submission (returned by the
    // student-facing assessment list and the single-assessment fetch).
    id?: string;
    userId?: string;
    score?: number | null;
    fileUrl?: string | null;
    feedback?: string | null;
    submittedAt?: string;
    gradedAt?: string | null;
}

interface Question {
    id: string;
    text: string;
    type: string;
    options: string[];
    marks: number;
}

export interface AssessmentWithDetails {
    id: string;
    title: string;
    description: string;
    type: string;
    courseId: string;
    totalMarks: number;
    dueDate: string | null;
    duration: number | null;
    isPublished: boolean;
    course: { code: string; title: string };
    questions?: Question[];
    submissions?: Submission[];
    _count?: { submissions: number };
}

export function useAssessments() {
    return useQuery<AssessmentWithDetails[]>({
        queryKey: ["assessments"],
        queryFn: async () => {
            const res = await fetch("/api/assessments");
            if (!res.ok) throw new Error("Failed to fetch assessments");
            return res.json();
        },
    });
}

export function useAssessment(id: string) {
    return useQuery<AssessmentWithDetails>({
        queryKey: ["assessment", id],
        queryFn: async () => {
            const res = await fetch(`/api/assessments/${id}`);
            if (!res.ok) throw new Error("Failed to fetch assessment details");
            return res.json();
        },
        enabled: !!id,
    });
}

export function useSubmitAssessment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, submission }: { id: string; submission: Record<string, any> }) => {
            const res = await fetch(`/api/assessments/${id}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submission),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to submit assessment");
            }
            return res.json();
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["assessments"] });
            queryClient.invalidateQueries({ queryKey: ["assessment", id] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] }); // Refresh grades
        },
    });
}

export interface SubmissionWithStudent extends Submission {
    user: { id: string; firstName: string; lastName: string; matricNumber: string | null };
    answers?: { questionId: string; answer: string; isCorrect: boolean | null }[];
}

export function useAssessmentSubmissions(assessmentId: string | null) {
    return useQuery<{ assessment: AssessmentWithDetails; submissions: SubmissionWithStudent[] }>({
        queryKey: ["assessment-submissions", assessmentId],
        queryFn: async () => {
            const res = await fetch(`/api/assessments/${assessmentId}/submissions`);
            if (!res.ok) throw new Error("Failed to fetch submissions");
            return res.json();
        },
        enabled: !!assessmentId,
    });
}

export function useGradeSubmission() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (vars: {
            id: string;
            assessmentId: string;
            score: number;
            feedback?: string;
        }) => {
            const { id, score, feedback } = vars;
            const res = await fetch(`/api/submissions/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ score, feedback }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to grade submission");
            }
            return res.json();
        },
        onSuccess: (_, { assessmentId }) => {
            queryClient.invalidateQueries({ queryKey: ["assessment-submissions", assessmentId] });
            queryClient.invalidateQueries({ queryKey: ["assessments"] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
        },
    });
}
