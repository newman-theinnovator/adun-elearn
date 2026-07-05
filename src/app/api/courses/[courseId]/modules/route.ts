import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { moduleSchema } from "@/lib/validators";
import * as z from "zod";
import {
    apiSuccess,
    unauthorized,
    forbidden,
    notFound,
    validationError,
    apiError,
} from "@/lib/api-response";

export async function GET(_req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    if (!session) return unauthorized();

    try {
        const { courseId } = await params;
        const modules = await prisma.module.findMany({
            where: { courseId },
            include: {
                contents: { orderBy: { order: "asc" } },
            },
            orderBy: { order: "asc" },
        });

        return apiSuccess(modules);
    } catch (error) {
        console.error("Error fetching modules:", error);
        return apiError(500, "Internal server error");
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    if (!session || (session.user.role !== "LECTURER" && session.user.role !== "ADMIN")) {
        return forbidden();
    }

    try {
        const { courseId } = await params;
        const course = await prisma.course.findUnique({ where: { id: courseId } });

        if (!course) return notFound("Course not found");
        if (session.user.role !== "ADMIN" && course.instructorId !== session.user.id) {
            return forbidden();
        }

        const body = await req.json();
        const parsedData = moduleSchema.parse(body);

        const newModule = await prisma.module.create({
            data: {
                ...parsedData,
                courseId: course.id,
            },
        });

        return apiSuccess(newModule, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationError(error);
        }
        console.error("Error creating module:", error);
        return apiError(500, "Internal server error");
    }
}
