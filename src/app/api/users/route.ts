import crypto from "crypto";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, validationError } from "@/lib/api-response";
import { userAdminCreateSchema } from "@/lib/validators";
import { sendNotificationEmail } from "@/lib/email";
import { APP_NAME } from "@/lib/branding";

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
                matricNumber: true,
                staffId: true,
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

export async function POST(req: Request) {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
        return apiError(403, "Unauthorized");
    }

    try {
        const body = await req.json();
        const parsed = userAdminCreateSchema.parse(body);

        const existingUser = await prisma.user.findUnique({ where: { email: parsed.email } });
        if (existingUser) {
            return apiError(409, "A user with this email already exists");
        }

        if (parsed.matricNumber) {
            const existingMatric = await prisma.user.findUnique({
                where: { matricNumber: parsed.matricNumber },
            });
            if (existingMatric) {
                return apiError(409, "A user with this matric number already exists");
            }
        }

        if (parsed.staffId) {
            const existingStaff = await prisma.user.findUnique({
                where: { staffId: parsed.staffId },
            });
            if (existingStaff) {
                return apiError(409, "A user with this staff ID already exists");
            }
        }

        const tempPassword = crypto.randomBytes(9).toString("base64url");
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        const user = await prisma.user.create({
            data: {
                firstName: parsed.firstName,
                lastName: parsed.lastName,
                email: parsed.email,
                password: hashedPassword,
                role: parsed.role,
                level: parsed.level,
                matricNumber: parsed.matricNumber || undefined,
                staffId: parsed.staffId || undefined,
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
                createdAt: true,
            },
        });

        await sendNotificationEmail(
            parsed.email,
            `Your ${APP_NAME} account has been created`,
            `Hi ${parsed.firstName},\n\nAn account has been created for you on ${APP_NAME}.\n\nEmail: ${parsed.email}\nTemporary password: ${tempPassword}\n\nPlease log in and change your password as soon as possible.`,
            `<p>Hi ${parsed.firstName},</p><p>An account has been created for you on ${APP_NAME}.</p><p>Email: ${parsed.email}<br/>Temporary password: <strong>${tempPassword}</strong></p><p>Please log in and change your password as soon as possible.</p>`
        );

        return apiSuccess(user, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationError(error);
        }
        console.error("Error creating user:", error);
        return apiError(500, "Internal server error");
    }
}
