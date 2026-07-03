import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, forbidden, apiError } from "@/lib/api-response";

// GET /api/analytics/lecturer — returns stats for the currently logged-in lecturer
export async function GET() {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        return forbidden();
    }

    try {
        const isAdmin = session.user.role === "ADMIN";
        const courseWhere = isAdmin ? {} : { instructorId: session.user.id };

        // Courses taught by this lecturer (or all for admin)
        const courseIds = (
            await prisma.course.findMany({
                where: courseWhere,
                select: { id: true },
            })
        ).map((c) => c.id);

        // Pending grading: submissions with status SUBMITTED (not yet GRADED)
        const pendingGrading = await prisma.submission.count({
            where: {
                status: "SUBMITTED",
                assessment: { courseId: { in: courseIds } },
            },
        });

        // Compute pass rate: among all graded submissions for this lecturer's courses,
        // how many scored >= assessment.passMark?
        const gradedSubmissions = await prisma.submission.findMany({
            where: {
                status: "GRADED",
                assessment: { courseId: { in: courseIds } },
            },
            include: {
                assessment: { select: { passMark: true } },
            },
        });

        let passed = 0;
        for (const s of gradedSubmissions) {
            if ((s.score || 0) >= s.assessment.passMark) {
                passed++;
            }
        }

        const passRate =
            gradedSubmissions.length > 0
                ? Math.round((passed / gradedSubmissions.length) * 100)
                : 0;

        const totalCourses = await prisma.course.count({ where: courseWhere });
        const totalStudents = await prisma.enrollment.count({ where: { course: courseWhere } });

        const courses = await prisma.course.findMany({
            where: courseWhere,
            select: { id: true, code: true, title: true },
        });

        const courseAverages = await Promise.all(
            courses.map(async (c) => {
                const subs = await prisma.submission.findMany({
                    where: {
                        assessment: { courseId: c.id },
                        status: "GRADED",
                        score: { not: null },
                    },
                    select: { score: true, assessment: { select: { totalMarks: true } } },
                });
                if (subs.length === 0) return { code: c.code, title: c.title, average: 0 };
                const avg =
                    subs.reduce(
                        (acc: number, s) => acc + (s.score! / s.assessment.totalMarks) * 100,
                        0
                    ) / subs.length;
                return { code: c.code, title: c.title, average: parseFloat(avg.toFixed(1)) };
            })
        );

        return apiSuccess({
            pendingGrading,
            passRate,
            totalGraded: gradedSubmissions.length,
            totalCourses,
            totalStudents,
            courseAverages,
        });
    } catch (error) {
        console.error("Error fetching lecturer stats:", error);
        return apiError(500, "Internal server error");
    }
}
