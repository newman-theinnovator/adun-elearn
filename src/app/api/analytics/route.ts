import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const grouped = await prisma.grade.groupBy({
    by: ["courseId"],
    _avg: { total: true },
  });

  const courseIds = grouped.map((g: any) => g.courseId);
  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
    select: { id: true, title: true },
  });

  const courseMap = new Map(courses.map((c: any) => [c.id, c.title]));

  const formatted = grouped.map((item: any) => ({
    course: courseMap.get(item.courseId) || `Course ${item.courseId}`,
    avgGrade: Number(item._avg.total?.toFixed(1)) || 0,
  }));

  return NextResponse.json(formatted);
}