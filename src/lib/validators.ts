import * as z from "zod";

export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// School/Faculty/Department/Year/Number, e.g. ADUN/FS/SEN/22/041
export const MATRIC_NUMBER_REGEX = /^ADUN\/[A-Z]{2,4}\/[A-Z]{2,4}\/\d{2}\/\d{3,4}$/;
export const MATRIC_NUMBER_FORMAT_HINT =
    "ADUN/FS/SEN/22/041 (School/Faculty/Department/Year/Number)";

const matricNumberField = z
    .string()
    .regex(MATRIC_NUMBER_REGEX, {
        message: `Matric number must follow the format ${MATRIC_NUMBER_FORMAT_HINT}`,
    })
    .optional()
    .or(z.literal(""));

export const userAdminCreateSchema = z.object({
    firstName: z.string().min(2, { message: "First name is required" }),
    lastName: z.string().min(2, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    role: z.enum(["STUDENT", "LECTURER", "ADMIN"]).default("STUDENT"),
    level: z.number().optional(),
    matricNumber: matricNumberField,
    staffId: z.string().optional(),
});

export const courseSchema = z.object({
    code: z.string().min(3),
    title: z.string().min(5),
    description: z.string().min(10),
    semester: z.string(),
    level: z.number().min(100).max(500),
    unit: z.number().min(1).max(6),
    isPublished: z.boolean().default(false),
});

export const moduleSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    order: z.number().min(1),
});

export const assessmentSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    type: z.enum(["QUIZ", "ASSIGNMENT", "EXAM"]),
    totalMarks: z.number().min(1),
    passMark: z.number().min(0),
    duration: z.number().nullable(),
    dueDate: z.string().nullable(),
    isPublished: z.boolean().default(false),
});

export const forumPostSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    body: z.string().min(1, { message: "Body is required" }),
    courseId: z.string().min(1, { message: "Course is required" }),
});

export const forumReplySchema = z.object({
    body: z.string().min(1, { message: "Reply content is required" }),
});

export const gradeUpdateSchema = z.object({
    id: z.string().min(1, { message: "Grade id is required" }),
    ca1: z.number().nullable().optional(),
    ca2: z.number().nullable().optional(),
    exam: z.number().nullable().optional(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
});

export const settingsSchema = z.object({
    emailNotifications: z.boolean().optional(),
    forumAlerts: z.boolean().optional(),
    gradeAlerts: z.boolean().optional(),
});

export const activityLogSchema = z.object({
    action: z.string().min(1, { message: "Action is required" }),
    metadata: z.record(z.string(), z.any()).optional(),
});

export const userUpdateSchema = z.object({
    firstName: z.string().min(2, { message: "First name is required" }).optional(),
    lastName: z.string().min(2, { message: "Last name is required" }).optional(),
    email: z.string().email({ message: "Invalid email address" }).optional(),
    role: z.enum(["STUDENT", "LECTURER", "ADMIN"]).optional(),
    isActive: z.boolean().optional(),
    level: z.number().nullable().optional(),
    matricNumber: matricNumberField,
    staffId: z.string().optional().or(z.literal("")),
});

export const assessmentSubmitSchema = z.object({
    answers: z.record(z.string(), z.string()).optional(),
    fileUrl: z.string().nullable().optional(),
});

export const submissionGradeSchema = z.object({
    score: z.number().min(0, { message: "Score cannot be negative" }),
    feedback: z.string().optional(),
});
