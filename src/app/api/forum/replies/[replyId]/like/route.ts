import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, unauthorized, notFound, apiError } from "@/lib/api-response";

/** Increments a forum reply's like counter. No per-user tracking — a simple engagement signal. */
export async function PUT(_req: Request, { params }: { params: Promise<{ replyId: string }> }) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const { replyId } = await params;

        const reply = await prisma.forumReply.findUnique({ where: { id: replyId } });
        if (!reply) return notFound("Reply not found");

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
