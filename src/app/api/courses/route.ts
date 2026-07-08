import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { courseSchema } from "@/lib/validators";
import * as z from "zod";
import { apiSuccess, unauthorized, forbidden, validationError, apiError } from "@/lib/api-response";

export async function GET(req: Request) {
    const session = await auth();
    if (!session) {
        return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const level = searchParams.get("level");
    const semester = searchParams.get("semester");

    try {
        const isStudent = session.user.role === "STUDENT";
        const isLecturer = session.user.role === "LECTURER";

        const where: any = {};

        if (isStudent) {
            // Students only see published courses at or below their own
            // level — mirrors the enrollment-level restriction, so students
            // can't even browse courses they're not eligible to take.
            where.isPublished = true;
            const student = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { level: true },
            });
            where.level = { lte: student?.level ?? 0 };
        }

        if (isLecturer) {
            // Lecturers only see courses they're assigned to teach.
            where.instructorId = session.user.id;
        }

        if (q) {
            where.OR = [
                { title: { contains: q, mode: "insensitive" } },
                { code: { contains: q, mode: "insensitive" } },
            ];
        }
        if (level) {
            const requestedLevel = parseInt(level, 10);
            // For students, an explicit ?level= filter can only narrow their
            // eligible range further, never bypass the cap above.
            where.level = isStudent
                ? { lte: Math.min(requestedLevel, where.level.lte) }
                : requestedLevel;
        }
        if (semester) where.semester = semester;

        const courses = await prisma.course.findMany({
            where,
            include: {
                instructor: { select: { firstName: true, lastName: true } },
                _count: { select: { enrollments: true, modules: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return apiSuccess(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return apiError(500, "Internal server error");
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session || (session.user.role !== "LECTURER" && session.user.role !== "ADMIN")) {
        return forbidden("Forbidden: Only lecturers or admins can create courses");
    }

    try {
        const body = await req.json();
        const parsedData = courseSchema.parse(body);

        const existingCourse = await prisma.course.findUnique({ where: { code: parsedData.code } });
        if (existingCourse) {
            return apiError(409, "Course code already exists");
        }

        const course = await prisma.course.create({
            data: {
                ...parsedData,
                instructorId: session.user.id,
            },
        });

        return apiSuccess(course, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationError(error);
        }
        console.error("Error creating course:", error);
        return apiError(500, "Internal server error");
    }
}
