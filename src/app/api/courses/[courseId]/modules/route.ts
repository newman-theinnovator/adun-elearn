import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { moduleSchema } from "@/lib/validators";
import * as z from "zod";

export async function GET(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const { courseId } = await params;
        const modules = await prisma.module.findMany({
            where: { courseId },
            include: {
                contents: { orderBy: { order: 'asc' } }
            },
            orderBy: { order: 'asc' }
        });

        return NextResponse.json(modules);
    } catch (error) {
        console.error("Error fetching modules:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    if (!session || (session.user.role !== "LECTURER" && session.user.role !== "ADMIN")) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const { courseId } = await params;
        const course = await prisma.course.findUnique({ where: { id: courseId } });

        if (!course) return NextResponse.json({ message: "Course not found" }, { status: 404 });
        if (session.user.role !== "ADMIN" && course.instructorId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const parsedData = moduleSchema.parse(body);

        const newModule = await prisma.module.create({
            data: {
                ...parsedData,
                courseId: course.id
            }
        });

        return NextResponse.json(newModule, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Validation error", errors: error.issues }, { status: 400 });
        }
        console.error("Error creating module:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
