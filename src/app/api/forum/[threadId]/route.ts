import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { forumReplySchema } from "@/lib/validators";
import * as z from "zod";
import { apiSuccess, unauthorized, notFound, validationError, apiError } from "@/lib/api-response";

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

        const post = await prisma.forumPost.findUnique({ where: { id: threadId } });
        if (!post) return notFound("Thread not found");

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

        // Notify the thread author
        if (post.authorId !== session.user.id) {
            await prisma.notification.create({
                data: {
                    userId: post.authorId,
                    title: "New reply to your post",
                    message: `${session.user.firstName} replied to "${post.title}"`,
                    link: `/dashboard/forum/${threadId}`,
                },
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
