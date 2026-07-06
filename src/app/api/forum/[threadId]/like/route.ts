import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, unauthorized, notFound, apiError } from "@/lib/api-response";

/** Increments a forum post's like counter. No per-user tracking — a simple engagement signal. */
export async function PUT(_req: Request, { params }: { params: Promise<{ threadId: string }> }) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const { threadId } = await params;

        const post = await prisma.forumPost.findUnique({ where: { id: threadId } });
        if (!post) return notFound("Thread not found");

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
