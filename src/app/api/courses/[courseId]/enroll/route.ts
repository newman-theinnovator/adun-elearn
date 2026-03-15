import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
        return NextResponse.json({ message: "Forbidden: Only students can enroll" }, { status: 403 });
    }

    try {
        const { courseId } = await params;

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return NextResponse.json({ message: "Course not found" }, { status: 404 });

        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId: course.id
                }
            }
        });

        if (existingEnrollment) {
            return NextResponse.json({ message: "Already enrolled" }, { status: 409 });
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                userId: session.user.id,
                courseId: course.id
            }
        });

        return NextResponse.json(enrollment, { status: 201 });
    } catch (error) {
        console.error("Error enrolling in course:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
