import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { action, metadata } = body;

        if (!action) return NextResponse.json({ message: "Action is required" }, { status: 400 });

        const activity = await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action,
                metadata: metadata || {}
            }
        });

        return NextResponse.json(activity, { status: 201 });
    } catch (error) {
        console.error("Error logging activity:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
