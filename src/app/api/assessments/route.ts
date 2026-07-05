import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { assessmentSchema } from "@/lib/validators";
import * as z from "zod";
import {
    apiSuccess,
    unauthorized,
    forbidden,
    notFound,
    validationError,
    apiError,
} from "@/lib/api-response";

export async function GET(_req: Request) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const isStudent = session.user.role === "STUDENT";

        let assessments;
        if (isStudent) {
            // Students see published assessments for courses they are enrolled in
            assessments = await prisma.assessment.findMany({
                where: {
                    isPublished: true,
                    course: {
                        enrollments: { some: { userId: session.user.id } },
                    },
                },
                include: {
                    course: { select: { code: true, title: true } },
                    submissions: {
                        where: { userId: session.user.id },
                    },
                },
                orderBy: { dueDate: "asc" },
            });
        } else {
            // Lecturers see all assessments for their courses. Admins see all.
            const where =
                session.user.role === "LECTURER"
                    ? { course: { instructorId: session.user.id } }
                    : {};

            assessments = await prisma.assessment.findMany({
                where,
                include: {
                    course: { select: { code: true, title: true } },
                    _count: { select: { submissions: true } },
                },
                orderBy: { createdAt: "desc" },
            });
        }

        return apiSuccess(assessments);
    } catch (error) {
        console.error("Error fetching assessments:", error);
        return apiError(500, "Internal server error");
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session || (session.user.role !== "LECTURER" && session.user.role !== "ADMIN")) {
        return forbidden();
    }

    try {
        const body = await req.json();
        const { courseId, questions, ...rest } = body;

        const parsedData = assessmentSchema.parse(rest);

        // Verify course ownership
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return notFound("Course not found");

        if (session.user.role !== "ADMIN" && course.instructorId !== session.user.id) {
            return forbidden("Forbidden: Not the course instructor");
        }

        const assessment = await prisma.assessment.create({
            data: {
                ...parsedData,
                courseId,
                dueDate: parsedData.dueDate ? new Date(parsedData.dueDate) : null,
                // Create questions inline if provided
                questions: questions
                    ? {
                          create: questions.map((q: any) => ({
                              text: q.text,
                              type: q.type,
                              options: q.options || [],
                              correctAnswer: q.correctAnswer,
                              marks: q.marks || 1,
                              order: q.order || 1,
                          })),
                      }
                    : undefined,
            },
            include: { questions: true },
        });

        return apiSuccess(assessment, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationError(error);
        }
        console.error("Error creating assessment:", error);
        return apiError(500, "Internal server error");
    }
}
