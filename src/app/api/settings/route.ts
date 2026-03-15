import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/settings — returns the current user's preferences
export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { preferences: true },
        });

        // Defaults
        const defaults = {
            emailNotifications: true,
            forumAlerts: true,
            gradeAlerts: true,
        };

        return NextResponse.json({ ...(defaults), ...(user?.preferences as object || {}) });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/settings — updates the current user's preferences
export async function PUT(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { emailNotifications, forumAlerts, gradeAlerts } = body;

        const updated = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                preferences: {
                    emailNotifications: !!emailNotifications,
                    forumAlerts: !!forumAlerts,
                    gradeAlerts: !!gradeAlerts,
                },
            },
            select: { preferences: true },
        });

        return NextResponse.json(updated.preferences);
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
