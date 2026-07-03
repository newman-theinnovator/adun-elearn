import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { settingsSchema } from "@/lib/validators";
import * as z from "zod";
import { apiSuccess, unauthorized, validationError, apiError } from "@/lib/api-response";

// GET /api/settings — returns the current user's preferences
export async function GET() {
    const session = await auth();
    if (!session) return unauthorized();

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

        return apiSuccess({ ...defaults, ...((user?.preferences as object) || {}) });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return apiError(500, "Internal server error");
    }
}

// PUT /api/settings — updates the current user's preferences
export async function PUT(req: Request) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const body = await req.json();
        const { emailNotifications, forumAlerts, gradeAlerts } = settingsSchema.parse(body);

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

        return apiSuccess(updated.preferences);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationError(error);
        }
        console.error("Error updating settings:", error);
        return apiError(500, "Internal server error");
    }
}
