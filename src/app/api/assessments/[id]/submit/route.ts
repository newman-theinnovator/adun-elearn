import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { assessmentSubmitSchema } from "@/lib/validators";
import * as z from "zod";
import { apiSuccess, forbidden, notFound, apiError, validationError } from "@/lib/api-response";
// Prisma enums used as string literals for type safety
const SubmissionStatus = {
    SUBMITTED: "SUBMITTED",
    GRADED: "GRADED",
    LATE: "LATE",
} as const;

const AssessmentType = {
    QUIZ: "QUIZ",
    ASSIGNMENT: "ASSIGNMENT",
    EXAM: "EXAM",
} as const;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
        return forbidden("Forbidden: Only students can submit");
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { answers, fileUrl } = assessmentSubmitSchema.parse(body); // answers is a map of questionId -> answer string

        const assessment = await prisma.assessment.findUnique({
            where: { id },
            include: { questions: true },
        });

        if (!assessment) return notFound("Assessment not found");

        // Check if already submitted
        const existing = await prisma.submission.findUnique({
            where: { userId_assessmentId: { userId: session.user.id, assessmentId: id } },
        });

        if (existing) {
            return apiError(409, "Already submitted");
        }

        let calculatedScore = 0;
        let needsManualGrading = false;
        const answerRecordsToCreate = [];

        // Auto-grading logic for quizzes
        if (assessment.type === AssessmentType.QUIZ && answers) {
            for (const question of assessment.questions) {
                const studentAnswer = answers[question.id] || "";
                let marksAwarded = 0;
                let isCorrect = false;

                if (question.type === "SHORT_ANSWER") {
                    needsManualGrading = true;
                    marksAwarded = 0; // Requires lecturer review
                } else {
                    // MCQ or TRUE_FALSE
                    isCorrect =
                        studentAnswer.trim().toLowerCase() ===
                        question.correctAnswer.trim().toLowerCase();
                    if (isCorrect) {
                        marksAwarded = question.marks;
                        calculatedScore += marksAwarded;
                    }
                }

                answerRecordsToCreate.push({
                    questionId: question.id,
                    answer: studentAnswer,
                    isCorrect: question.type === "SHORT_ANSWER" ? null : isCorrect,
                    marksAwarded,
                });
            }
        } else if (assessment.type === AssessmentType.ASSIGNMENT) {
            needsManualGrading = true;
        }

        // A submission made after the due date is still accepted (real
        // students submit late), but flagged distinctly so lecturers can see
        // it was late and students see an honest "submitted late" state
        // instead of a normal "awaiting grade" one. Auto-graded quizzes
        // still get a real score either way — lateness is a policy concern
        // for the lecturer to factor in manually, not a grading gate.
        const isLate = assessment.dueDate ? new Date() > assessment.dueDate : false;
        const submissionStatus = needsManualGrading
            ? isLate
                ? SubmissionStatus.LATE
                : SubmissionStatus.SUBMITTED
            : SubmissionStatus.GRADED;

        const submission = await prisma.submission.create({
            data: {
                userId: session.user.id,
                assessmentId: id,
                status: submissionStatus,
                score: needsManualGrading ? null : calculatedScore,
                fileUrl: fileUrl || null,
                answers:
                    answerRecordsToCreate.length > 0
                        ? {
                              create: answerRecordsToCreate,
                          }
                        : undefined,
            },
        });

        // If auto-graded immediately, we could also log something to Activity Log here
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "SUBMIT_ASSESSMENT",
                metadata: { assessmentId: id, type: assessment.type, autoGrade: calculatedScore },
            },
        });

        return apiSuccess(submission, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationError(error);
        }
        console.error("Error submitting assessment:", error);
        return apiError(500, "Internal server error");
    }
}
