import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, forbidden, notFound, apiError } from "@/lib/api-response";

export async function PUT(_req: Request, { params }: { params: Promise<{ threadId: string }> }) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        return forbidden();
    }

    try {
        const { threadId } = await params;
        const post = await prisma.forumPost.findUnique({
            where: { id: threadId },
            include: { course: true },
        });

        if (!post) return notFound("Thread not found");

        // Ensure they are the lecturer of the course, or an admin
        if (session.user.role !== "ADMIN" && post.course.instructorId !== session.user.id) {
            return forbidden();
        }

        const updated = await prisma.forumPost.update({
            where: { id: threadId },
            data: { isPinned: !post.isPinned }, // Toggle pin
        });

        return apiSuccess(updated);
    } catch (error) {
        console.error("Error pinning forum thread:", error);
        return apiError(500, "Internal server error");
    }
}
