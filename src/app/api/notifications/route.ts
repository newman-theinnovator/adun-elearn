import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: [
                { isRead: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
