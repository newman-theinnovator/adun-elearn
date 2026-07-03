import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validators";
import * as z from "zod";
import { apiSuccess, apiError, validationError } from "@/lib/api-response";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsedData = registerSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: { email: parsedData.email },
        });

        if (existingUser) {
            return apiError(409, "User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(parsedData.password, 12);

        const user = await prisma.user.create({
            data: {
                firstName: parsedData.firstName,
                lastName: parsedData.lastName,
                email: parsedData.email,
                password: hashedPassword,
                role: parsedData.role as any,
                level: parsedData.level,
                matricNumber: parsedData.matricNumber,
                staffId: parsedData.staffId,
            },
        });

        return apiSuccess(
            {
                message: "User created successfully",
                user: { id: user.id, email: user.email, role: user.role },
            },
            201
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationError(error);
        }
        console.error("Registration error:", error);
        return apiError(500, "Internal server error");
    }
}
