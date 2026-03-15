import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        // 1. Core stats
        const totalStudents = await prisma.user.count({ where: { role: "STUDENT", isActive: true } });
        const totalLecturers = await prisma.user.count({ where: { role: "LECTURER", isActive: true } });
        const totalCourses = await prisma.course.count({});
        const activeEnrollments = await prisma.enrollment.count();

        // 2. Average GPA across all students
        const allGrades = await prisma.grade.findMany({ include: { course: true } });
        let globalPoints = 0;
        let globalUnits = 0;

        allGrades.forEach((g: any) => {
            if (g.gradePoint !== null && g.course.unit) {
                globalPoints += g.gradePoint * g.course.unit;
                globalUnits += g.course.unit;
            }
        });
        const departmentAverageGPA = globalUnits > 0 ? (globalPoints / globalUnits).toFixed(2) : "0.00";

        // 3. Performance by level
        const students = await prisma.user.findMany({ where: { role: "STUDENT" }, select: { id: true, level: true } });
        const levelGPA: Record<number, { points: number, units: number }> = {};

        for (const student of students) {
            if (!student.level) continue;
            const studentGrades = allGrades.filter(g => g.userId === student.id);

            if (!levelGPA[student.level]) levelGPA[student.level] = { points: 0, units: 0 };

            studentGrades.forEach((g: any) => {
                if (g.gradePoint !== null && g.course.unit) {
                    levelGPA[student.level!].points += g.gradePoint * g.course.unit;
                    levelGPA[student.level!].units += g.course.unit;
                }
            });
        }

        const performanceByLevel = Object.keys(levelGPA).map(lvl => ({
            level: parseInt(lvl, 10),
            averageGPA: levelGPA[parseInt(lvl, 10)].units > 0
                ? (levelGPA[parseInt(lvl, 10)].points / levelGPA[parseInt(lvl, 10)].units).toFixed(2)
                : "0.00"
        }));

        // 4. Most popular courses
        const popularCourses = await prisma.course.findMany({
            take: 5,
            orderBy: { enrollments: { _count: 'desc' } },
            select: { code: true, title: true, _count: { select: { enrollments: true } } }
        });

        return NextResponse.json({
            overview: {
                totalStudents,
                totalLecturers,
                totalCourses,
                activeEnrollments,
                departmentAverageGPA
            },
            performanceByLevel,
            popularCourses: popularCourses.map((p: any) => ({
                code: p.code,
                title: p.title,
                students: p._count.enrollments
            }))
        });

    } catch (error) {
        console.error("Error generating department analytics:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
