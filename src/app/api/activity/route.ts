import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, unauthorized, validationError, apiError } from "@/lib/api-response";
import { activityLogSchema } from "@/lib/validators";
import * as z from "zod";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const body = await req.json();
        const parsed = activityLogSchema.parse(body);

        const activity = await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: parsed.action,
                metadata: parsed.metadata || {},
            },
        });

        return apiSuccess(activity, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationError(error);
        }
        console.error("Error logging activity:", error);
        return apiError(500, "Internal server error");
    }
}
