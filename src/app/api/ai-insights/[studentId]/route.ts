import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess } from "@/lib/api-response";
import { generateInsightNarrative } from "@/lib/ai-insights";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ studentId: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { studentId } = await context.params;

        if (!studentId) {
            return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
        }

        // Students can only view their own insights
        if (session.user.role === "STUDENT" && session.user.id !== studentId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const student = await prisma.user.findUnique({
            where: { id: studentId },
            include: {
                grades: { include: { course: true } },
                submissions: {
                    include: { assessment: { include: { course: true } } },
                },
            },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        let totalScore = 0;
        let maxPossibleScore = 0;
        let scoreCount = 0;

        const courseScores: Record<string, { total: number; max: number; name: string }> = {};

        // Process Grades
        student.grades.forEach((g) => {
            if (g.total !== null && g.courseId) {
                totalScore += g.total;
                maxPossibleScore += 100;
                scoreCount++;

                if (!courseScores[g.courseId]) {
                    courseScores[g.courseId] = { total: 0, max: 0, name: g.course.title };
                }
                courseScores[g.courseId].total += g.total;
                courseScores[g.courseId].max += 100;
            }
        });

        // Process Submissions
        student.submissions.forEach((s) => {
            if (s.score !== null && s.assessment.totalMarks) {
                totalScore += s.score;
                maxPossibleScore += s.assessment.totalMarks;
                scoreCount++;

                const courseId = s.assessment.courseId;
                if (!courseScores[courseId]) {
                    courseScores[courseId] = { total: 0, max: 0, name: s.assessment.course.title };
                }
                courseScores[courseId].total += s.score;
                courseScores[courseId].max += s.assessment.totalMarks;
            }
        });

        let predictedGrade = 0;
        let confidence = 0;
        let strongestArea = "Pending...";
        let areaToImprove = "Pending...";

        if (maxPossibleScore > 0) {
            const percentage = (totalScore / maxPossibleScore) * 100;

            // Deterministic prediction — no Math.random()
            predictedGrade = Math.min(100, Math.max(0, Math.round(percentage)));

            // Confidence grows with more data points, capped at 85%
            confidence = Math.min(
                85,
                15 +
                    (scoreCount > 0 ? 20 : 0) +
                    (scoreCount > 2 ? 20 : 0) +
                    (scoreCount > 5 ? 30 : 0)
            );

            let maxAvg = -1;
            let minAvg = 101;

            for (const [, data] of Object.entries(courseScores)) {
                if (data.max > 0) {
                    const avg = (data.total / data.max) * 100;
                    if (avg > maxAvg) {
                        maxAvg = avg;
                        strongestArea = data.name;
                    }
                    if (avg < minAvg) {
                        minAvg = avg;
                        areaToImprove = data.name;
                    }
                }
            }
        } else {
            predictedGrade = 0;
            confidence = 15;
            strongestArea = "N/A (No Data)";
            areaToImprove = "N/A (No Data)";
        }

        const explanation = await generateInsightNarrative(studentId, {
            firstName: student.firstName,
            predictedGrade,
            confidence,
            strongestArea,
            areaToImprove,
            scoreCount,
        });

        return apiSuccess({
            predictedGrade,
            confidence,
            strongestArea,
            areaToImprove,
            explanation,
        });
    } catch (error) {
        console.error("AI Insights Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
