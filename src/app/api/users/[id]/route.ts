import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { role, isActive } = body;
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
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    try {
        const { id } = await params;

        // Soft delete
        await prisma.user.update({
            where: { id },
            data: { isActive: false },
        });

        return NextResponse.json({ message: "User deactivated successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
