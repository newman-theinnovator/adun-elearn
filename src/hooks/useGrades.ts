import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface GradeRecord {
    id: string;
    courseId: string;
    semester: string;
    session: string;
    ca1: number | null;
    ca2: number | null;
    exam: number | null;
    total: number | null;
    grade: string | null;
    gradePoint: number | null;
    course: {
        code: string;
        title: string;
        unit: number;
    };
}

export function useGrades(courseId?: string) {
    return useQuery<GradeRecord[]>({
        queryKey: ["grades", courseId],
        queryFn: async () => {
            const url = courseId ? `/api/grades?courseId=${courseId}` : "/api/grades";
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch grades");
            return res.json();
        },
    });
}

export function useUpdateGrade() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            ca1,
            ca2,
            exam,
        }: {
            id: string;
            ca1: number;
            ca2: number;
            exam: number;
        }) => {
            const res = await fetch("/api/grades", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ca1, ca2, exam }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to update grade");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["grades"] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
        },
    });
}
