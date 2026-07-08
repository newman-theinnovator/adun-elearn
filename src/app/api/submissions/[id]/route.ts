import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { submissionGradeSchema } from "@/lib/validators";
import * as z from "zod";
import { apiSuccess, forbidden, notFound, validationError, apiError } from "@/lib/api-response";

/**
 * Lecturer/admin-only: grade a single student's submission (score + optional
 * feedback). Marks it GRADED regardless of whether it was on-time or LATE —
 * lateness is a policy note for the lecturer, not a grading gate — and
 * notifies the student, same pattern as posting a course grade.
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        return forbidden();
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { score, feedback } = submissionGradeSchema.parse(body);

        const submission = await prisma.submission.findUnique({
            where: { id },
            include: {
                assessment: { include: { course: { select: { instructorId: true, code: true } } } },
            },
        });
        if (!submission) return notFound("Submission not found");

        if (
            session.user.role !== "ADMIN" &&
            submission.assessment.course.instructorId !== session.user.id
        ) {
            return forbidden("Forbidden: Not the course instructor");
        }

        if (score > submission.assessment.totalMarks) {
            return apiError(
                400,
                `Score cannot exceed the assessment's total marks (${submission.assessment.totalMarks})`
            );
        }

        const updated = await prisma.submission.update({
            where: { id },
            data: {
                score,
                feedback: feedback || null,
                status: "GRADED",
                gradedAt: new Date(),
            },
        });

        await prisma.notification.create({
            data: {
                userId: submission.userId,
                title: "Grade posted",
                message: `Your submission for "${submission.assessment.title}" (${submission.assessment.course.code}) has been graded: ${score}/${submission.assessment.totalMarks}.`,
                link: "/dashboard/assessments",
            },
        });

        return apiSuccess(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationError(error);
        }
        console.error("Error grading submission:", error);
        return apiError(500, "Internal server error");
    }
}
