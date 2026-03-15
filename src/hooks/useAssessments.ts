import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Submission {
    id: string;
    score: number | null;
    status: string;
    fileUrl: string | null;
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
    dueDate: string;
    timeLimit: number;
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
