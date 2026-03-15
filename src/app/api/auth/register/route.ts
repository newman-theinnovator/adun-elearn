import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { registerSchema } from "@/lib/validators"
import * as z from "zod"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const parsedData = registerSchema.parse(body)

        const existingUser = await prisma.user.findUnique({
            where: { email: parsedData.email }
        })

        if (existingUser) {
            return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
        }

        const hashedPassword = await bcrypt.hash(parsedData.password, 12)

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
            }
        })

        return NextResponse.json({
            message: "User created successfully",
            user: { id: user.id, email: user.email, role: user.role }
        }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Validation error", errors: error.issues }, { status: 400 })
        }
        console.error("Registration error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
