import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, forbidden, notFound, apiError } from "@/lib/api-response";

export async function GET(_req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        return forbidden();
    }

    try {
        const { courseId } = await params;

        // Auth check
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return notFound("Course not found");
        if (session.user.role !== "ADMIN" && course.instructorId !== session.user.id) {
            return forbidden();
        }

        // Class average score
        const grades = await prisma.grade.findMany({
            where: { courseId },
            include: { user: { select: { firstName: true, lastName: true, matricNumber: true } } },
        });
        const classAverageScore =
            grades.length > 0
                ? grades.reduce((acc, curr) => acc + (curr.total || 0), 0) / grades.length
                : 0;

        // Score distribution (histogram buckets)
        const distribution = { "0-39": 0, "40-49": 0, "50-59": 0, "60-69": 0, "70-100": 0 };
        grades.forEach((g) => {
            const t = g.total || 0;
            if (t >= 70) distribution["70-100"]++;
            else if (t >= 60) distribution["60-69"]++;
            else if (t >= 50) distribution["50-59"]++;
            else if (t >= 40) distribution["40-49"]++;
            else distribution["0-39"]++;
        });

        // At-risk students
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Students with average below 45% or zero recent logins
        const atRiskStudents = [];
        const topPerformers = [];

        // Group students by performance
        const sortedGrades = [...grades].sort((a, b) => (b.total || 0) - (a.total || 0));

        for (const g of sortedGrades) {
            const u = g.user;
            if (!u) continue;

            if ((g.total || 0) < 45) {
                atRiskStudents.push({ ...u, reason: `Low score: ${g.total}` });
            }

            if (topPerformers.length < 5 && (g.total || 0) >= 70) {
                topPerformers.push({ ...u, score: g.total });
            }
        }

        // Engagement metrics
        const activities = await prisma.activityLog.findMany({
            where: {
                metadata: { path: ["courseId"], equals: courseId },
            },
        });

        return apiSuccess({
            classAverageScore: classAverageScore.toFixed(1),
            distribution,
            atRiskStudents,
            topPerformers,
            engagement: {
                totalCourseViews: activities.filter((a) => a.action === "VIEW_COURSE").length,
            },
        });
    } catch (error) {
        console.error("Error generating course analytics:", error);
        return apiError(500, "Internal server error");
    }
}
