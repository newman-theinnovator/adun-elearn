import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, notFound } from "@/lib/api-response";
import { sendNotificationEmail } from "@/lib/email";
import { APP_NAME } from "@/lib/branding";

/**
 * Admin-only: generates a new temporary password for an existing account,
 * emails it to the user, and also returns it in the response so an admin can
 * relay it immediately (e.g. during a live demo) without depending on email
 * delivery being configured.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
        return apiError(403, "Unauthorized");
    }

    try {
        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, firstName: true },
        });
        if (!user) return notFound("User not found");

        const tempPassword = crypto.randomBytes(9).toString("base64url");
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });

        await sendNotificationEmail(
            user.email,
            `Your ${APP_NAME} password has been reset`,
            `Hi ${user.firstName},\n\nAn administrator has reset your password.\n\nTemporary password: ${tempPassword}\n\nPlease log in and change your password as soon as possible.`,
            `<p>Hi ${user.firstName},</p><p>An administrator has reset your password.</p><p>Temporary password: <strong>${tempPassword}</strong></p><p>Please log in and change your password as soon as possible.</p>`
        );

        return apiSuccess({ tempPassword });
    } catch (error) {
        console.error("Error resetting password:", error);
        return apiError(500, "Internal server error");
    }
}
