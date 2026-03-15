import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ threadId: string }> }) {
    const session = await auth();
    if (!session || session.user.role === "STUDENT") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const { threadId } = await params;
        const post = await prisma.forumPost.findUnique({ where: { id: threadId }, include: { course: true } });

        if (!post) return NextResponse.json({ message: "Thread not found" }, { status: 404 });

        // Ensure they are the lecturer of the course, or an admin
        if (session.user.role !== "ADMIN" && post.course.instructorId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const updated = await prisma.forumPost.update({
            where: { id: threadId },
            data: { isPinned: !post.isPinned } // Toggle pin
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error pinning forum thread:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
