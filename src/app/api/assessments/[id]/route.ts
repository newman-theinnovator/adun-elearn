import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await params;
        const isStudent = session.user.role === "STUDENT";

        const assessment = await prisma.assessment.findUnique({
            where: { id },
            include: {
                course: { select: { code: true, title: true, instructorId: true } },
                questions: { orderBy: { order: 'asc' } },
                submissions: {
                    where: isStudent ? { userId: session.user.id } : undefined, // Include only student's own submission if student
                    include: isStudent ? undefined : { user: { select: { firstName: true, lastName: true, matricNumber: true } } }
                }
            }
        });

        if (!assessment) return NextResponse.json({ message: "Assessment not found" }, { status: 404 });

        // Students cannot view unpublished assessments
        if (!assessment.isPublished && isStudent) {
            return NextResponse.json({ message: "Assessment unavailable" }, { status: 403 });
        }

        if (isStudent) {
            // Remove correct answers from the payload so students can't cheat
            assessment.questions = assessment.questions.map((q: any) => {
                const { correctAnswer, ...safeQuestion } = q;
                return safeQuestion as any;
            });
        }

        return NextResponse.json(assessment);
    } catch (error) {
        console.error("Error fetching assessment:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
