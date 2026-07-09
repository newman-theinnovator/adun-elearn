import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, unauthorized, forbidden, notFound, apiError } from "@/lib/api-response";

/**
 * Lecturer/admin-only: every student's submission for one assessment, so the
 * "View Submissions" action on the Assessments page can actually show and
 * grade them (previously a decorative button with no backing endpoint).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") return unauthorized();

    try {
        const { id } = await params;

        const assessment = await prisma.assessment.findUnique({
            where: { id },
            include: { course: { select: { instructorId: true, code: true, title: true } } },
        });
        if (!assessment) return notFound("Assessment not found");

        if (session.user.role !== "ADMIN" && assessment.course.instructorId !== session.user.id) {
            return forbidden("Forbidden: Not the course instructor");
        }

        const submissions = await prisma.submission.findMany({
            where: { assessmentId: id },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, matricNumber: true },
                },
                answers: { include: { question: true } },
            },
            orderBy: { submittedAt: "asc" },
        });

        return apiSuccess({ assessment, submissions });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return apiError(500, "Internal server error");
    }
}
