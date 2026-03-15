import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ threadId: string }> }) {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const { threadId } = await params;

        const post = await prisma.forumPost.findUnique({
            where: { id: threadId },
            include: {
                author: { select: { firstName: true, lastName: true, role: true, profileImage: true } },
                replies: {
                    include: {
                        author: { select: { firstName: true, lastName: true, role: true, profileImage: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!post) return NextResponse.json({ message: "Thread not found" }, { status: 404 });

        return NextResponse.json(post);
    } catch (error) {
        console.error("Error fetching forum thread:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ threadId: string }> }) {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const { threadId } = await params;
        const body = await req.json();
        const { body: content } = body;

        if (!content) return NextResponse.json({ message: "Reply content is required" }, { status: 400 });

        const post = await prisma.forumPost.findUnique({ where: { id: threadId } });
        if (!post) return NextResponse.json({ message: "Thread not found" }, { status: 404 });

        const reply = await prisma.forumReply.create({
            data: {
                body: content,
                postId: threadId,
                authorId: session.user.id
            }
        });

        // Award engagement activity
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "REPLY_FORUM_POST",
                metadata: { courseId: post.courseId, threadId, replyId: reply.id }
            }
        });

        // Notify the thread author
        if (post.authorId !== session.user.id) {
            await prisma.notification.create({
                data: {
                    userId: post.authorId,
                    title: "New reply to your post",
                    message: `${session.user.firstName} replied to "${post.title}"`,
                    link: `/dashboard/forum/${threadId}`
                }
            });
        }

        return NextResponse.json(reply, { status: 201 });
    } catch (error) {
        console.error("Error creating forum reply:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
