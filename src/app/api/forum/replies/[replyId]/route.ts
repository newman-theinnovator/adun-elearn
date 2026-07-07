import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, unauthorized, forbidden, notFound, apiError } from "@/lib/api-response";

export async function DELETE(_req: Request, { params }: { params: Promise<{ replyId: string }> }) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const { replyId } = await params;

        const reply = await prisma.forumReply.findUnique({ where: { id: replyId } });
        if (!reply) return notFound("Reply not found");

        // Moderation: the admin, or the original author, can delete a reply
        if (session.user.role !== "ADMIN" && reply.authorId !== session.user.id) {
            return forbidden();
        }

        await prisma.forumReply.delete({ where: { id: replyId } });

        return apiSuccess({ message: "Reply deleted successfully" });
    } catch (error) {
        console.error("Error deleting forum reply:", error);
        return apiError(500, "Internal server error");
    }
}
