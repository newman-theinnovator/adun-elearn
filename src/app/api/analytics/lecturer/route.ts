import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/analytics/lecturer — returns stats for the currently logged-in lecturer
export async function GET() {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
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

        return NextResponse.json({
            pendingGrading,
            passRate,
            totalGraded: gradedSubmissions.length,
        });
    } catch (error) {
        console.error("Error fetching lecturer stats:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
