import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { gradeUpdateSchema } from "@/lib/validators";
import * as z from "zod";
import {
    apiSuccess,
    unauthorized,
    forbidden,
    notFound,
    validationError,
    apiError,
} from "@/lib/api-response";

export async function GET(req: Request) {
    const session = await auth();
    if (!session) return unauthorized();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    try {
        let grades;
        const role = session.user.role;

        if (role === "STUDENT") {
            grades = await prisma.grade.findMany({
                where: { userId: session.user.id, ...(courseId && { courseId }) },
                include: { course: { select: { code: true, title: true, unit: true } } },
                orderBy: { course: { code: "asc" } },
            });
        } else if (role === "LECTURER") {
            grades = await prisma.grade.findMany({
                where: {
                    user: { coursesTeaching: { some: { instructorId: session.user.id } } },
                    ...(courseId && { courseId }),
                },
                include: {
                    user: { select: { firstName: true, lastName: true, matricNumber: true } },
                },
            });
        } else {
            // ADMIN
            grades = await prisma.grade.findMany({
                where: { ...(courseId && { courseId }) },
                include: {
                    user: { select: { firstName: true, lastName: true, matricNumber: true } },
                },
            });
        }

        return apiSuccess(grades);
    } catch (error) {
        console.error("Error fetching grades:", error);
        return apiError(500, "Internal server error");
    }
}

export async function PUT(req: Request) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        return forbidden();
    }

    try {
        const body = await req.json();
        const { id, ca1, ca2, exam } = gradeUpdateSchema.parse(body);

        const gradeRecord = await prisma.grade.findUnique({
            where: { id },
        });

        if (!gradeRecord) return notFound("Grade not found");

        const course = await prisma.course.findUnique({ where: { id: gradeRecord.courseId } });
        if (session.user.role !== "ADMIN" && course?.instructorId !== session.user.id) {
            return forbidden();
        }

        // Auto-calculate total and letter grade
        const total = (ca1 || 0) + (ca2 || 0) + (exam || 0);

        let letterGrade = "F";
        let gradePoint = 0.0;

        if (total >= 70) {
            letterGrade = "A";
            gradePoint = 5.0;
        } else if (total >= 60) {
            letterGrade = "B";
            gradePoint = 4.0;
        } else if (total >= 50) {
            letterGrade = "C";
            gradePoint = 3.0;
        } else if (total >= 45) {
            letterGrade = "D";
            gradePoint = 2.0;
        } else if (total >= 40) {
            letterGrade = "E";
            gradePoint = 1.0;
        }

        const updated = await prisma.grade.update({
            where: { id },
            data: {
                ca1,
                ca2,
                exam,
                total,
                grade: letterGrade,
                gradePoint,
            },
        });

        return apiSuccess(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationError(error);
        }
        console.error("Error updating grade:", error);
        return apiError(500, "Internal server error");
    }
}
