import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const isSpecificCourse = courseId && courseId !== "all";

    try {
        let where: any = {};

        if (isSpecificCourse) {
            where.courseId = courseId;
        } else if (session.user.role === "STUDENT") {
            // Students see posts from courses they are enrolled in
            where.course = { enrollments: { some: { userId: session.user.id } } };
        }
        // Admins and Lecturers see all posts when no specific course is selected

        const posts = await prisma.forumPost.findMany({
            where,
            include: {
                author: { select: { firstName: true, lastName: true, role: true, profileImage: true } },
                course: { select: { code: true } },
                _count: { select: { replies: true } }
            },
            orderBy: [
                { isPinned: "desc" },
                { createdAt: "desc" }
            ]
        });

        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error fetching forum posts:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { title, body: content, courseId } = body;

        if (!title || !content || !courseId) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const post = await prisma.forumPost.create({
            data: {
                title,
                body: content,
                courseId,
                authorId: session.user.id
            }
        });

        // Award immediate minor engagement activity
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "CREATE_FORUM_POST",
                metadata: { courseId, postId: post.id }
            }
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error("Error creating forum post:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
