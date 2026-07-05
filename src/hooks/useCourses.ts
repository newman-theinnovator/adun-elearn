import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Frontend types matching Prisma models
export type Course = {
    id: string;
    code: string;
    title: string;
    description: string;
    semester: string;
    level: number;
    unit: number;
    isPublished: boolean;
    instructorId: string;
    createdAt: string;
    updatedAt: string;
};

export type Module = {
    id: string;
    title: string;
    description?: string | null;
    order: number;
    courseId: string;
    createdAt: string;
    updatedAt: string;
};

export type Content = {
    id: string;
    title: string;
    type: string;
    url?: string | null;
    body?: string | null;
    order: number;
    moduleId: string;
    createdAt: string;
    updatedAt: string;
};

// Extended types for frontend relationships
export type CourseWithDetails = Course & {
    instructor: { firstName: string; lastName: string };
    _count: { enrollments: number; modules: number };
    isEnrolled?: boolean;
};

export type ModuleWithContent = Module & {
    contents: Content[];
};

export function useCourses(level?: string) {
    return useQuery<CourseWithDetails[]>({
        queryKey: ["courses", level],
        queryFn: async () => {
            const url = level ? `/api/courses?level=${level}` : "/api/courses";
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch courses");
            return res.json();
        },
    });
}

export function useCourse(courseId: string) {
    return useQuery<CourseWithDetails & { modules: ModuleWithContent[] }>({
        queryKey: ["course", courseId],
        queryFn: async () => {
            const res = await fetch(`/api/courses/${courseId}`);
            if (!res.ok) throw new Error("Failed to fetch course details");
            return res.json();
        },
        enabled: !!courseId,
    });
}

export function useEnroll() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (courseId: string) => {
            const res = await fetch(`/api/courses/${courseId}/enroll`, {
                method: "POST",
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to enroll");
            }
            return res.json();
        },
        onSuccess: (_, courseId) => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            queryClient.invalidateQueries({ queryKey: ["course", courseId] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
        },
    });
}
