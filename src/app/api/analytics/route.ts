import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const grouped = await prisma.grade.groupBy({
            by: ["courseId"],
            _avg: { total: true },
        });

        const courseIds = grouped.map((g) => g.courseId);
        const courses = await prisma.course.findMany({
            where: { id: { in: courseIds } },
            select: { id: true, title: true },
        });

        const courseMap = new Map(courses.map((c) => [c.id, c.title]));

        const formatted = grouped.map((item) => ({
            course: courseMap.get(item.courseId) || `Course ${item.courseId}`,
            avgGrade: Number(item._avg.total?.toFixed(1)) || 0,
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}