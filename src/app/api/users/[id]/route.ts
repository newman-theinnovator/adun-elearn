import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { userUpdateSchema } from "@/lib/validators";
import * as z from "zod";
import { apiSuccess, apiError, validationError } from "@/lib/api-response";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
        return apiError(403, "Unauthorized");
    }

    try {
        const body = await req.json();
        const { role, isActive } = userUpdateSchema.parse(body);
        const { id } = await params;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(role && { role }),
                ...(isActive !== undefined && { isActive }),
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
            },
        });

        return apiSuccess(updatedUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationError(error);
        }
        console.error("Error updating user:", error);
        return apiError(500, "Internal server error");
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
        return apiError(403, "Unauthorized");
    }

    try {
        const { id } = await params;

        // Soft delete
        await prisma.user.update({
            where: { id },
            data: { isActive: false },
        });

        return apiSuccess({ message: "User deactivated successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return apiError(500, "Internal server error");
    }
}
