import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { courseSchema } from "@/lib/validators";
import * as z from "zod";

export async function GET(req: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const level = searchParams.get("level");
    const semester = searchParams.get("semester");

    try {
        const isStudent = session.user.role === "STUDENT";

        // Students only see published courses. Lecturers see all, Admins see all.
        const where: any = {};
        if (isStudent) where.isPublished = true;
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { code: { contains: q, mode: 'insensitive' } }
            ];
        }
        if (level) where.level = parseInt(level, 10);
        if (semester) where.semester = semester;

        const courses = await prisma.course.findMany({
            where,
            include: {
                instructor: { select: { firstName: true, lastName: true } },
                _count: { select: { enrollments: true, modules: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session || (session.user.role !== "LECTURER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ message: "Forbidden: Only lecturers or admins can create courses" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const parsedData = courseSchema.parse(body);

        const existingCourse = await prisma.course.findUnique({ where: { code: parsedData.code } });
        if (existingCourse) {
            return NextResponse.json({ message: "Course code already exists" }, { status: 409 });
        }

        const course = await prisma.course.create({
            data: {
                ...parsedData,
                instructorId: session.user.id
            }
        });

        return NextResponse.json(course, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Validation error", errors: error.issues }, { status: 400 });
        }
        console.error("Error creating course:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
