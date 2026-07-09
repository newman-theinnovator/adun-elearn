import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, unauthorized, forbidden, notFound, apiError } from "@/lib/api-response";

/** Increments a forum reply's like counter. No per-user tracking — a simple engagement signal. */
export async function PUT(_req: Request, { params }: { params: Promise<{ replyId: string }> }) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const { replyId } = await params;

        const reply = await prisma.forumReply.findUnique({
            where: { id: replyId },
            include: {
                post: { include: { course: { select: { semester: true, instructorId: true } } } },
            },
        });
        if (!reply) return notFound("Reply not found");

        // A lecturer may only interact with courses they teach.
        if (
            session.user.role === "LECTURER" &&
            reply.post.course.instructorId !== session.user.id
        ) {
            return forbidden("You do not teach this course");
        }

        // Discussions tied to a completed semester are archived — read-only.
        if (reply.post.course.semester === "First") {
            return forbidden("This discussion is archived and no longer accepts likes");
        }

        const updated = await prisma.forumReply.update({
            where: { id: replyId },
            data: { likes: { increment: 1 } },
        });

        return apiSuccess(updated);
    } catch (error) {
        console.error("Error liking forum reply:", error);
        return apiError(500, "Internal server error");
    }
}
