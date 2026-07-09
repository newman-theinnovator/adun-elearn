import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { forumReplySchema } from "@/lib/validators";
import * as z from "zod";
import {
    apiSuccess,
    unauthorized,
    forbidden,
    notFound,
    validationError,
    apiError,
} from "@/lib/api-response";

export async function GET(_req: Request, { params }: { params: Promise<{ threadId: string }> }) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const { threadId } = await params;

        const post = await prisma.forumPost.findUnique({
            where: { id: threadId },
            include: {
                author: {
                    select: { firstName: true, lastName: true, role: true, profileImage: true },
                },
                course: { select: { code: true, semester: true } },
                replies: {
                    include: {
                        author: {
                            select: {
                                firstName: true,
                                lastName: true,
                                role: true,
                                profileImage: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!post) return notFound("Thread not found");

        return apiSuccess(post);
    } catch (error) {
        console.error("Error fetching forum thread:", error);
        return apiError(500, "Internal server error");
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ threadId: string }> }) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const { threadId } = await params;
        const body = await req.json();
        const parsed = forumReplySchema.parse(body);

        const post = await prisma.forumPost.findUnique({
            where: { id: threadId },
            include: { course: { select: { semester: true } } },
        });
        if (!post) return notFound("Thread not found");

        // Discussions tied to a completed semester are archived — read-only.
        if (post.course.semester === "First") {
            return forbidden("This discussion is archived and no longer accepts replies");
        }

        const reply = await prisma.forumReply.create({
            data: {
                body: parsed.body,
                postId: threadId,
                authorId: session.user.id,
            },
        });

        // Award engagement activity
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "REPLY_FORUM_POST",
                metadata: { courseId: post.courseId, threadId, replyId: reply.id },
            },
        });

        // Notify everyone else involved in the thread — the original poster and
        // anyone else who has replied — so the conversation feels alive to the
        // people actually participating in it.
        const priorReplies = await prisma.forumReply.findMany({
            where: { postId: threadId },
            select: { authorId: true },
            distinct: ["authorId"],
        });
        const recipientIds = new Set<string>([
            post.authorId,
            ...priorReplies.map((r) => r.authorId),
        ]);
        recipientIds.delete(session.user.id);

        if (recipientIds.size > 0) {
            await prisma.notification.createMany({
                data: Array.from(recipientIds).map((userId) => ({
                    userId,
                    title: "New reply to a discussion",
                    message: `${session.user.firstName} replied to "${post.title}"`,
                    link: "/dashboard/forum",
                })),
            });
        }

        return apiSuccess(reply, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationError(error);
        }
        console.error("Error creating forum reply:", error);
        return apiError(500, "Internal server error");
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ threadId: string }> }) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const { threadId } = await params;

        const post = await prisma.forumPost.findUnique({ where: { id: threadId } });
        if (!post) return notFound("Thread not found");

        // Moderation: the admin, or the original author, can delete a thread
        if (session.user.role !== "ADMIN" && post.authorId !== session.user.id) {
            return forbidden();
        }

        // Cascades to delete all replies (schema: onDelete: Cascade)
        await prisma.forumPost.delete({ where: { id: threadId } });

        return apiSuccess({ message: "Thread deleted successfully" });
    } catch (error) {
        console.error("Error deleting forum thread:", error);
        return apiError(500, "Internal server error");
    }
}
