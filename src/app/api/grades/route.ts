import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    try {
        let grades;
        const role = session.user.role;

        if (role === "STUDENT") {
            grades = await prisma.grade.findMany({
                where: { userId: session.user.id, ...(courseId && { courseId }) },
                include: { course: { select: { code: true, title: true, unit: true } } },
                orderBy: { course: { code: "asc" } }
            });
        } else if (role === "LECTURER") {
            grades = await prisma.grade.findMany({
                where: {
                    user: { coursesTeaching: { some: { instructorId: session.user.id } } },
                    ...(courseId && { courseId })
                },
                include: { user: { select: { firstName: true, lastName: true, matricNumber: true } } }
            });
        } else { // ADMIN
            grades = await prisma.grade.findMany({
                where: { ...(courseId && { courseId }) },
                include: {
                    user: { select: { firstName: true, lastName: true, matricNumber: true } }
                }
            });
        }

        return NextResponse.json(grades);
    } catch (error) {
        console.error("Error fetching grades:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { id, ca1, ca2, exam } = body;

        const gradeRecord = await prisma.grade.findUnique({
            where: { id }
        });

        if (!gradeRecord) return NextResponse.json({ message: "Grade not found" }, { status: 404 });

        const course = await prisma.course.findUnique({ where: { id: gradeRecord.courseId } });
        if (session.user.role !== "ADMIN" && course?.instructorId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Auto-calculate total and letter grade
        const total = (ca1 || 0) + (ca2 || 0) + (exam || 0);

        let letterGrade = "F";
        let gradePoint = 0.0;

        if (total >= 70) { letterGrade = "A"; gradePoint = 5.0; }
        else if (total >= 60) { letterGrade = "B"; gradePoint = 4.0; }
        else if (total >= 50) { letterGrade = "C"; gradePoint = 3.0; }
        else if (total >= 45) { letterGrade = "D"; gradePoint = 2.0; }
        else if (total >= 40) { letterGrade = "E"; gradePoint = 1.0; }

        const updated = await prisma.grade.update({
            where: { id },
            data: {
                ca1,
                ca2,
                exam,
                total,
                grade: letterGrade,
                gradePoint
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating grade:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
