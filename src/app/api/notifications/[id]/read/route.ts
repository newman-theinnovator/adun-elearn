import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await params;

        // Auth check: Is this the user's notification?
        const notification = await prisma.notification.findUnique({ where: { id } });
        if (!notification) return NextResponse.json({ message: "Not found" }, { status: 404 });
        if (notification.userId !== session.user.id) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
