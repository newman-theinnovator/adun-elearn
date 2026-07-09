import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, unauthorized, forbidden, notFound, apiError } from "@/lib/api-response";

/** Increments a forum post's like counter. No per-user tracking — a simple engagement signal. */
export async function PUT(_req: Request, { params }: { params: Promise<{ threadId: string }> }) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const { threadId } = await params;

        const post = await prisma.forumPost.findUnique({
            where: { id: threadId },
            include: { course: { select: { semester: true, instructorId: true } } },
        });
        if (!post) return notFound("Thread not found");

        // A lecturer may only interact with courses they teach.
        if (session.user.role === "LECTURER" && post.course.instructorId !== session.user.id) {
            return forbidden("You do not teach this course");
        }

        // Discussions tied to a completed semester are archived — read-only.
        if (post.course.semester === "First") {
            return forbidden("This discussion is archived and no longer accepts likes");
        }

        const updated = await prisma.forumPost.update({
            where: { id: threadId },
            data: { likes: { increment: 1 } },
        });

        return apiSuccess(updated);
    } catch (error) {
        console.error("Error liking forum post:", error);
        return apiError(500, "Internal server error");
    }
}
