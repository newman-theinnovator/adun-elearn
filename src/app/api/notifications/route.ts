import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, unauthorized, apiError } from "@/lib/api-response";

export async function GET(_req: Request) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
        });

        return apiSuccess(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return apiError(500, "Internal server error");
    }
}
