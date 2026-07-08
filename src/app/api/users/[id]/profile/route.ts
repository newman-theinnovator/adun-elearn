import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { predictFinalScore, getLetterGrade } from "@/lib/analytics";
import { apiSuccess, apiError, notFound } from "@/lib/api-response";

/**
 * Admin-only: full profile for a single user — enrollments, grades across every
 * semester (current + previous), and a performance summary for students; the
 * courses they teach for lecturers. Used by the User Management "View Profile"
 * panel so admins don't have to piece this together from several endpoints.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
        return apiError(403, "Unauthorized");
    }

    try {
        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                department: true,
                level: true,
                matricNumber: true,
                staffId: true,
                isActive: true,
                createdAt: true,
            },
        });
        if (!user) return notFound("User not found");

        if (user.role === "LECTURER") {
            const coursesTeaching = await prisma.course.findMany({
                where: { instructorId: id },
                select: {
                    id: true,
                    code: true,
                    title: true,
                    semester: true,
                    level: true,
                    unit: true,
                    isPublished: true,
                    _count: { select: { enrollments: true } },
                },
                orderBy: [{ semester: "asc" }, { code: "asc" }],
            });

            return apiSuccess({ user, coursesTeaching });
        }

        if (user.role === "ADMIN") {
            return apiSuccess({ user });
        }

        // STUDENT: enrollments, full grade history, and performance summary
        const [enrollments, grades, submissions, activities, forumPostsCount, forumRepliesCount] =
            await Promise.all([
                prisma.enrollment.findMany({
                    where: { userId: id },
                    include: {
                        course: {
                            select: {
                                id: true,
                                code: true,
                                title: true,
                                semester: true,
                                level: true,
                                unit: true,
                            },
                        },
                    },
                    orderBy: { course: { code: "asc" } },
                }),
                prisma.grade.findMany({
                    where: { userId: id },
                    include: {
                        course: { select: { code: true, title: true, unit: true } },
                    },
                    orderBy: [{ session: "desc" }, { semester: "asc" }],
                }),
                prisma.submission.findMany({
                    where: { userId: id },
                    include: { assessment: true },
                }),
                prisma.activityLog.findMany({ where: { userId: id } }),
                prisma.forumPost.count({ where: { authorId: id } }),
                prisma.forumReply.count({ where: { authorId: id } }),
            ]);

        // Group grades by "session - semester" so the admin can see current vs
        // previous semester performance at a glance.
        const bySemester: Record<string, typeof grades> = {};
        let totalPoints = 0;
        let totalUnits = 0;
        for (const g of grades) {
            const key = `${g.session} - ${g.semester} Semester`;
            (bySemester[key] ??= []).push(g);
            if (g.gradePoint !== null && g.course.unit) {
                totalPoints += g.gradePoint * g.course.unit;
                totalUnits += g.course.unit;
            }
        }
        const cgpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00";

        const contentProgress = await prisma.contentProgress.findMany({ where: { userId: id } });
        const completedContent = contentProgress.filter((p) => p.completed).length;
        const contentCompletionRate =
            contentProgress.length > 0 ? (completedContent / contentProgress.length) * 100 : 0;

        const loginCount = activities.filter((a) => a.action === "LOGIN").length;
        const engagementScore = Math.min(100, (loginCount / 50) * 100);
        const forumParticipationScore = Math.min(
            100,
            ((forumPostsCount + forumRepliesCount) / 20) * 100
        );

        const quizzes = submissions.filter((s) => s.assessment.type === "QUIZ" && s.score !== null);
        const assignments = submissions.filter(
            (s) => s.assessment.type === "ASSIGNMENT" && s.score !== null
        );
        const averageQuizScore =
            quizzes.length > 0
                ? quizzes.reduce(
                      (acc, curr) => acc + (curr.score! / curr.assessment.totalMarks) * 100,
                      0
                  ) / quizzes.length
                : 0;
        const averageAssignmentScore =
            assignments.length > 0
                ? assignments.reduce(
                      (acc, curr) => acc + (curr.score! / curr.assessment.totalMarks) * 100,
                      0
                  ) / assignments.length
                : 0;

        const { score: predictedScore, confidence } = predictFinalScore({
            averageQuizScore,
            averageAssignmentScore,
            engagementScore,
            forumParticipationScore,
            contentCompletionRate,
        });

        return apiSuccess({
            user,
            enrollments,
            gradesBySemester: Object.entries(bySemester).map(([semester, semesterGrades]) => ({
                semester,
                grades: semesterGrades,
            })),
            summary: {
                cgpa,
                predictedGrade: getLetterGrade(predictedScore),
                confidence,
                loginCount,
                contentCompletionRate: Math.round(contentCompletionRate),
                forumActivity: forumPostsCount + forumRepliesCount,
            },
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return apiError(500, "Internal server error");
    }
}
