import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, unauthorized, notFound, forbidden, apiError } from "@/lib/api-response";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const { id } = await params;
        const isStudent = session.user.role === "STUDENT";

        const assessment = await prisma.assessment.findUnique({
            where: { id },
            include: {
                course: { select: { code: true, title: true, instructorId: true } },
                questions: { orderBy: { order: "asc" } },
                submissions: {
                    where: isStudent ? { userId: session.user.id } : undefined, // Include only student's own submission if student
                    include: isStudent
                        ? undefined
                        : {
                              user: {
                                  select: { firstName: true, lastName: true, matricNumber: true },
                              },
                          },
                },
            },
        });

        if (!assessment) return notFound("Assessment not found");

        // Students cannot view unpublished assessments
        if (!assessment.isPublished && isStudent) {
            return forbidden("Assessment unavailable");
        }

        if (isStudent) {
            // Remove correct answers from the payload so students can't cheat
            assessment.questions = assessment.questions.map((q: any) => {
                const { correctAnswer, ...safeQuestion } = q;
                return safeQuestion as any;
            });
        }

        return apiSuccess(assessment);
    } catch (error) {
        console.error("Error fetching assessment:", error);
        return apiError(500, "Internal server error");
    }
}
