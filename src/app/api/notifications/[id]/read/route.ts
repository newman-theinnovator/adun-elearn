import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, unauthorized, forbidden, notFound, apiError } from "@/lib/api-response";

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const { id } = await params;

        // Auth check: Is this the user's notification?
        const notification = await prisma.notification.findUnique({ where: { id } });
        if (!notification) return notFound();
        if (notification.userId !== session.user.id) return forbidden();

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        return apiSuccess(updated);
    } catch (error) {
        console.error("Error updating notification:", error);
        return apiError(500, "Internal server error");
    }
}
