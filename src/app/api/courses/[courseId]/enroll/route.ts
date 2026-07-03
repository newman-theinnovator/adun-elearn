import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, forbidden, notFound, apiError } from "@/lib/api-response";

export async function POST(_req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
        return forbidden("Forbidden: Only students can enroll");
    }

    try {
        const { courseId } = await params;

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return notFound("Course not found");

        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId: course.id,
                },
            },
        });

        if (existingEnrollment) {
            return apiError(409, "Already enrolled");
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                userId: session.user.id,
                courseId: course.id,
            },
        });

        return apiSuccess(enrollment, 201);
    } catch (error) {
        console.error("Error enrolling in course:", error);
        return apiError(500, "Internal server error");
    }
}
