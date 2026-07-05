import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { forumPostSchema } from "@/lib/validators";
import * as z from "zod";
import { apiSuccess, unauthorized, validationError, apiError } from "@/lib/api-response";

export async function GET(req: Request) {
    const session = await auth();
    if (!session) return unauthorized();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const isSpecificCourse = courseId && courseId !== "all";

    try {
        const where: any = {};

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
                author: {
                    select: { firstName: true, lastName: true, role: true, profileImage: true },
                },
                course: { select: { code: true } },
                _count: { select: { replies: true } },
            },
            orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        });

        return apiSuccess(posts);
    } catch (error) {
        console.error("Error fetching forum posts:", error);
        return apiError(500, "Internal server error");
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const body = await req.json();
        const parsed = forumPostSchema.parse(body);

        const post = await prisma.forumPost.create({
            data: {
                title: parsed.title,
                body: parsed.body,
                courseId: parsed.courseId,
                authorId: session.user.id,
            },
        });

        // Award immediate minor engagement activity
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "CREATE_FORUM_POST",
                metadata: { courseId: parsed.courseId, postId: post.id },
            },
        });

        return apiSuccess(post, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationError(error);
        }
        console.error("Error creating forum post:", error);
        return apiError(500, "Internal server error");
    }
}
