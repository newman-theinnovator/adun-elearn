import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, unauthorized, forbidden, notFound, apiError } from "@/lib/api-response";

export async function GET(_req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const { courseId } = await params;

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                instructor: { select: { id: true, firstName: true, lastName: true, email: true } },
                modules: {
                    include: { contents: { orderBy: { order: "asc" } } },
                    orderBy: { order: "asc" },
                },
                _count: { select: { enrollments: true } },
                ...(session.user.role === "STUDENT" && {
                    enrollments: { where: { userId: session.user.id } },
                }),
            },
        });

        if (!course) return notFound("Course not found");

        // Students cannot view unpublished courses unless they are somehow enrolled
        if (!course.isPublished && session.user.role === "STUDENT") {
            return forbidden("Course unavailable");
        }

        // Students can't view a course above their level either — otherwise
        // the level restriction on the course list could be bypassed by
        // navigating straight to a course's URL.
        if (session.user.role === "STUDENT") {
            const student = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { level: true },
            });
            if (!student?.level || course.level > student.level) {
                return forbidden("Course unavailable at your level");
            }
        }

        // Attach an 'isEnrolled' boolean derived from the relation if the user is a student
        const responseData = { ...course, isEnrolled: course.enrollments?.length > 0 };

        return apiSuccess(responseData);
    } catch (error) {
        console.error("Error fetching course details:", error);
        return apiError(500, "Internal server error");
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        return forbidden();
    }

    try {
        const { courseId } = await params;

        // Authorization check: Must be admin or the course instructor
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return notFound("Course not found");

        if (session.user.role !== "ADMIN" && course.instructorId !== session.user.id) {
            return forbidden("Forbidden: Note the course instructor");
        }

        const body = await req.json();
        const updated = await prisma.course.update({
            where: { id: courseId },
            data: body,
        });

        return apiSuccess(updated);
    } catch (error) {
        console.error("Error updating course:", error);
        return apiError(500, "Internal server error");
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        return forbidden();
    }

    try {
        const { courseId } = await params;
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return notFound("Course not found");

        if (session.user.role !== "ADMIN" && course.instructorId !== session.user.id) {
            return forbidden();
        }

        await prisma.course.delete({ where: { id: courseId } });
        return apiSuccess({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        return apiError(500, "Internal server error");
    }
}
