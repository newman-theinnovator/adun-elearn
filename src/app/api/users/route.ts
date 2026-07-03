import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: Request) {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
        return apiError(403, "Unauthorized");
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    try {
        const users = await prisma.user.findMany({
            where: role ? { role: role as any } : undefined,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                department: true,
                level: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return apiSuccess(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return apiError(500, "Internal server error");
    }
}
