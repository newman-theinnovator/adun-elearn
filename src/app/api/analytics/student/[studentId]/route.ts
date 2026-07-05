import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { predictFinalScore, getLetterGrade } from "@/lib/analytics";
import { apiSuccess, unauthorized, forbidden, apiError } from "@/lib/api-response";

export async function GET(_req: Request, { params }: { params: Promise<{ studentId: string }> }) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const { studentId } = await params;

        // Authorization: Admin, or the student themselves
        if (session.user.role === "STUDENT" && session.user.id !== studentId) {
            return forbidden();
        }

        // 1. Fetch Grades
        const grades = await prisma.grade.findMany({
            where: { userId: studentId },
            include: { course: true },
        });

        let totalPoints = 0;
        let totalUnits = 0;
        const gradeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
        const semesterGPA: Record<string, { points: number; units: number }> = {};

        grades.forEach((g) => {
            if (g.gradePoint !== null && g.course.unit) {
                totalPoints += g.gradePoint * g.course.unit;
                totalUnits += g.course.unit;

                const semKey = `${g.session} - ${g.semester}`;
                if (!semesterGPA[semKey]) semesterGPA[semKey] = { points: 0, units: 0 };
                semesterGPA[semKey].points += g.gradePoint * g.course.unit;
                semesterGPA[semKey].units += g.course.unit;
            }
            if (g.grade) {
                gradeDistribution[g.grade] = (gradeDistribution[g.grade] || 0) + 1;
            }
        });

        const cgpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00";
        const gpaTrend = Object.keys(semesterGPA).map((key) => ({
            semester: key,
            gpa: parseFloat((semesterGPA[key].points / semesterGPA[key].units).toFixed(2)),
        }));

        // 2. Fetch Activity for Engagement
        const activities = await prisma.activityLog.findMany({
            where: { userId: studentId },
        });
        const loginCount = activities.filter((a) => a.action === "LOGIN").length;
        // Normalize engagement score (heuristic: 50 logins = perfect 100 engagement)
        const engagementScore = Math.min(100, (loginCount / 50) * 100);

        // 3. Fetch Forum Posts
        const forumPostsCount = await prisma.forumPost.count({ where: { authorId: studentId } });
        const forumRepliesCount = await prisma.forumReply.count({ where: { authorId: studentId } });
        const forumParticipationScore = Math.min(
            100,
            ((forumPostsCount + forumRepliesCount) / 20) * 100
        );

        // 4. Content Progress
        const progressRecords = await prisma.contentProgress.findMany({
            where: { userId: studentId },
        });
        const completedContent = progressRecords.filter((p) => p.completed).length;
        const totalTimeSpent = progressRecords.reduce((acc, curr) => acc + curr.timeSpent, 0);
        const contentCompletionRate = Math.min(
            100,
            progressRecords.length > 0 ? (completedContent / progressRecords.length) * 100 : 0
        );

        // 5. Assessments (Quiz + Assignment scores)
        const submissions = await prisma.submission.findMany({
            where: { userId: studentId },
            include: { assessment: true },
        });

        const quizzes = submissions.filter((s) => s.assessment.type === "QUIZ" && s.score !== null);
        const assignments = submissions.filter(
            (s) => s.assessment.type === "ASSIGNMENT" && s.score !== null
        );

        const averageQuizScore =
            quizzes.length > 0
                ? quizzes.reduce(
                      (acc: number, curr) => acc + (curr.score! / curr.assessment.totalMarks) * 100,
                      0
                  ) / quizzes.length
                : 0;

        const averageAssignmentScore =
            assignments.length > 0
                ? assignments.reduce(
                      (acc: number, curr) => acc + (curr.score! / curr.assessment.totalMarks) * 100,
                      0
                  ) / assignments.length
                : 0;

        // Predictions
        const { score: predictedScore, confidence } = predictFinalScore({
            averageQuizScore,
            averageAssignmentScore,
            engagementScore,
            forumParticipationScore,
            contentCompletionRate,
        });

        const predictedGrade = getLetterGrade(predictedScore);

        const enrolledCoursesCount = await prisma.enrollment.count({
            where: { userId: studentId },
        });
        const pendingTasksCount = await prisma.assessment.count({
            where: {
                isPublished: true,
                course: { enrollments: { some: { userId: studentId } } },
                submissions: { none: { userId: studentId } },
            },
        });

        return apiSuccess({
            cgpa,
            gpaTrend,
            gradeDistribution,
            enrolledCoursesCount,
            pendingTasksCount,
            engagement: {
                loginCount,
                totalTimeSpentMinutes: Math.floor(totalTimeSpent / 60),
                forumPosts: forumPostsCount + forumRepliesCount,
            },
            predictions: {
                predictedScore: predictedScore.toFixed(1),
                predictedGrade,
                confidence,
            },
            strengths:
                averageQuizScore > averageAssignmentScore ? "Objective Testing" : "Project Work",
            weaknesses:
                averageQuizScore < 50
                    ? "Quiz Preparation"
                    : engagementScore < 40
                      ? "Platform Engagement"
                      : "None identified",
        });
    } catch (error) {
        console.error("Error generating student analytics:", error);
        return apiError(500, "Internal server error");
    }
}
