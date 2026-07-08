import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { userUpdateSchema } from "@/lib/validators";
import * as z from "zod";
import { apiSuccess, apiError, notFound, validationError } from "@/lib/api-response";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
        return apiError(403, "Unauthorized");
    }

    try {
        const body = await req.json();
        const parsed = userUpdateSchema.parse(body);
        const { id } = await params;

        const existing = await prisma.user.findUnique({ where: { id } });
        if (!existing) return notFound("User not found");

        if (parsed.email && parsed.email !== existing.email) {
            const emailTaken = await prisma.user.findUnique({ where: { email: parsed.email } });
            if (emailTaken) return apiError(409, "A user with this email already exists");
        }

        if (parsed.matricNumber && parsed.matricNumber !== existing.matricNumber) {
            const matricTaken = await prisma.user.findUnique({
                where: { matricNumber: parsed.matricNumber },
            });
            if (matricTaken) return apiError(409, "A user with this matric number already exists");
        }

        if (parsed.staffId && parsed.staffId !== existing.staffId) {
            const staffIdTaken = await prisma.user.findUnique({
                where: { staffId: parsed.staffId },
            });
            if (staffIdTaken) return apiError(409, "A user with this staff ID already exists");
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(parsed.firstName && { firstName: parsed.firstName }),
                ...(parsed.lastName && { lastName: parsed.lastName }),
                ...(parsed.email && { email: parsed.email }),
                ...(parsed.role && { role: parsed.role }),
                ...(parsed.isActive !== undefined && { isActive: parsed.isActive }),
                ...(parsed.level !== undefined && { level: parsed.level }),
                ...(parsed.matricNumber !== undefined && {
                    matricNumber: parsed.matricNumber || null,
                }),
                ...(parsed.staffId !== undefined && { staffId: parsed.staffId || null }),
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                department: true,
                level: true,
                matricNumber: true,
                staffId: true,
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
