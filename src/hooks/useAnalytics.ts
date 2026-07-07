import { useQuery } from "@tanstack/react-query";

interface StudentAnalytics {
    cgpa: string;
    gpaTrend: { semester: string; gpa: number }[];
    gradeDistribution: Record<string, number>;
    enrolledCoursesCount: number;
    pendingTasksCount: number;
    engagement: {
        loginCount: number;
        totalTimeSpentMinutes: number;
        forumPosts: number;
    };
    predictions: {
        predictedScore: string;
        predictedGrade: string;
        confidence: number;
    };
    strengths: string;
    weaknesses: string;
}

interface DepartmentAnalytics {
    overview: {
        totalStudents: number;
        totalLecturers: number;
        totalCourses: number;
        activeEnrollments: number;
        departmentAverageGPA: string;
    };
    performanceByLevel: { level: number; averageGPA: number }[];
    popularCourses: { code: string; title: string; students: number }[];
}

export function useStudentAnalytics(studentId: string) {
    return useQuery<StudentAnalytics>({
        queryKey: ["analytics", "student", studentId],
        queryFn: async () => {
            const res = await fetch(`/api/analytics/student/${studentId}`);
            if (!res.ok) throw new Error("Failed to fetch student analytics");
            return res.json();
        },
        enabled: !!studentId,
    });
}

interface CourseAnalytics {
    classAverageScore: string;
    distribution: Record<string, number>;
    atRiskStudents: {
        firstName: string;
        lastName: string;
        matricNumber: string | null;
        reason: string;
    }[];
    topPerformers: {
        firstName: string;
        lastName: string;
        matricNumber: string | null;
        score: number | null;
    }[];
    engagement: { totalCourseViews: number };
}

export function useCourseAnalytics(courseId: string) {
    return useQuery<CourseAnalytics>({
        queryKey: ["analytics", "course", courseId],
        queryFn: async () => {
            const res = await fetch(`/api/analytics/course/${courseId}`);
            if (!res.ok) throw new Error("Failed to fetch course analytics");
            return res.json();
        },
        enabled: !!courseId,
    });
}

export function useDepartmentAnalytics(enabled = true) {
    return useQuery<DepartmentAnalytics>({
        queryKey: ["analytics", "department"],
        queryFn: async () => {
            const res = await fetch("/api/analytics/department");
            if (!res.ok) throw new Error("Failed to fetch department analytics");
            return res.json();
        },
        enabled,
    });
}

interface LecturerAnalytics {
    pendingGrading: number;
    passRate: number;
    totalGraded: number;
    totalCourses: number;
    totalStudents: number;
    courseAverages: { code: string; title: string; average: number }[];
}

export function useLecturerAnalytics(enabled: boolean) {
    return useQuery<LecturerAnalytics>({
        queryKey: ["analytics", "lecturer"],
        queryFn: async () => {
            const res = await fetch("/api/analytics/lecturer");
            if (!res.ok) throw new Error("Failed to fetch lecturer analytics");
            return res.json();
        },
        enabled,
    });
}
