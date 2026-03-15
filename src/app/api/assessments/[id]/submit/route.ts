import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SubmissionStatus, AssessmentType } from "@prisma/client";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
        return NextResponse.json({ message: "Forbidden: Only students can submit" }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { answers, fileUrl } = body; // answers is a map of questionId -> answer string

        const assessment = await prisma.assessment.findUnique({
            where: { id },
            include: { questions: true }
        });

        if (!assessment) return NextResponse.json({ message: "Assessment not found" }, { status: 404 });

        // Check if already submitted
        const existing = await prisma.submission.findUnique({
            where: { userId_assessmentId: { userId: session.user.id, assessmentId: id } }
        });

        if (existing) {
            return NextResponse.json({ message: "Already submitted" }, { status: 409 });
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
                    isCorrect = studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
                    if (isCorrect) {
                        marksAwarded = question.marks;
                        calculatedScore += marksAwarded;
                    }
                }

                answerRecordsToCreate.push({
                    questionId: question.id,
                    answer: studentAnswer,
                    isCorrect: question.type === "SHORT_ANSWER" ? null : isCorrect,
                    marksAwarded
                });
            }
        } else if (assessment.type === AssessmentType.ASSIGNMENT) {
            needsManualGrading = true;
        }

        const submissionStatus = needsManualGrading ? SubmissionStatus.SUBMITTED : SubmissionStatus.GRADED;

        const submission = await prisma.submission.create({
            data: {
                userId: session.user.id,
                assessmentId: id,
                status: submissionStatus,
                score: needsManualGrading ? null : calculatedScore,
                fileUrl: fileUrl || null,
                answers: answerRecordsToCreate.length > 0 ? {
                    create: answerRecordsToCreate
                } : undefined
            }
        });

        // If auto-graded immediately, we could also log something to Activity Log here
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "SUBMIT_ASSESSMENT",
                metadata: { assessmentId: id, type: assessment.type, autoGrade: calculatedScore }
            }
        });

        return NextResponse.json(submission, { status: 201 });
    } catch (error) {
        console.error("Error submitting assessment:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
