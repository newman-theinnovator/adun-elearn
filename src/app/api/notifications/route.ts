import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, unauthorized, apiError } from "@/lib/api-response";

export async function GET(_req: Request) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        // Fetch the most recent 50 (newest first, bounded), then reverse so the
        // panel reads oldest-to-newest like a conversation feed.
        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        return apiSuccess(notifications.reverse());
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return apiError(500, "Internal server error");
    }
}
