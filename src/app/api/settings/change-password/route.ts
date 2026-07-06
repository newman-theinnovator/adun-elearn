import bcrypt from "bcryptjs";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validators";
import { apiSuccess, unauthorized, apiError, validationError } from "@/lib/api-response";

/** Self-service password change for the currently logged-in user. */
export async function PUT(req: Request) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const body = await req.json();
        const { currentPassword, newPassword } = changePasswordSchema.parse(body);

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true },
        });
        if (!user) return unauthorized();

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return apiError(400, "Current password is incorrect");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        });

        return apiSuccess({ message: "Password updated successfully" });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationError(error);
        }
        console.error("Error changing password:", error);
        return apiError(500, "Internal server error");
    }
}
