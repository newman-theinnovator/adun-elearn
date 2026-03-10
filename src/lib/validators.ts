import * as z from "zod"

export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export const registerSchema = z.object({
    firstName: z.string().min(2, { message: "First name is required" }),
    lastName: z.string().min(2, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    role: z.enum(["STUDENT", "LECTURER", "ADMIN"]).default("STUDENT"),
    level: z.number().optional(),
    matricNumber: z.string().optional(),
    staffId: z.string().optional()
})

export const courseSchema = z.object({
    code: z.string().min(3),
    title: z.string().min(5),
    description: z.string().min(10),
    semester: z.string(),
    level: z.number().min(100).max(500),
    unit: z.number().min(1).max(6),
    isPublished: z.boolean().default(false)
})

export const moduleSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    order: z.number().min(1)
})

export const assessmentSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    type: z.enum(["QUIZ", "ASSIGNMENT", "EXAM"]),
    totalMarks: z.number().min(1),
    passMark: z.number().min(0),
    duration: z.number().nullable(),
    dueDate: z.string().nullable(),
    isPublished: z.boolean().default(false)
})
