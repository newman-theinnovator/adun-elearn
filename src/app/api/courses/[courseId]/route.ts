import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const { courseId } = await params;

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                instructor: { select: { id: true, firstName: true, lastName: true, email: true } },
                modules: {
                    include: { contents: { orderBy: { order: 'asc' } } },
                    orderBy: { order: 'asc' }
                },
                _count: { select: { enrollments: true } },
                ...(session.user.role === 'STUDENT' && {
                    enrollments: { where: { userId: session.user.id } }
                })
            }
        });

        if (!course) return NextResponse.json({ message: "Course not found" }, { status: 404 });

        // Students cannot view unpublished courses unless they are somehow enrolled
        if (!course.isPublished && session.user.role === "STUDENT") {
            return NextResponse.json({ message: "Course unavailable" }, { status: 403 });
        }

        // Attach an 'isEnrolled' boolean derived from the relation if the user is a student
        const responseData = { ...course, isEnrolled: course.enrollments?.length > 0 };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Error fetching course details:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const { courseId } = await params;

        // Authorization check: Must be admin or the course instructor
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return NextResponse.json({ message: "Course not found" }, { status: 404 });

        if (session.user.role !== "ADMIN" && course.instructorId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden: Note the course instructor" }, { status: 403 });
        }

        const body = await req.json();
        const updated = await prisma.course.update({
            where: { id: courseId },
            data: body
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating course:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const { courseId } = await params;
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return NextResponse.json({ message: "Course not found" }, { status: 404 });

        if (session.user.role !== "ADMIN" && course.instructorId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await prisma.course.delete({ where: { id: courseId } });
        return NextResponse.json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
