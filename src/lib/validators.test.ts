import { describe, expect, it } from "vitest";
import {
    loginSchema,
    userAdminCreateSchema,
    courseSchema,
    moduleSchema,
    assessmentSchema,
} from "./validators";

describe("loginSchema", () => {
    it("accepts a valid login payload", () => {
        expect(loginSchema.safeParse({ email: "a@b.com", password: "secret1" }).success).toBe(true);
    });

    it("rejects an invalid email", () => {
        expect(loginSchema.safeParse({ email: "not-an-email", password: "secret1" }).success).toBe(
            false
        );
    });

    it("rejects a too-short password", () => {
        expect(loginSchema.safeParse({ email: "a@b.com", password: "123" }).success).toBe(false);
    });
});

describe("userAdminCreateSchema", () => {
    it("defaults role to STUDENT and requires no password", () => {
        const result = userAdminCreateSchema.parse({
            firstName: "Ada",
            lastName: "Lovelace",
            email: "ada@b.com",
        });
        expect(result.role).toBe("STUDENT");
    });

    it("rejects an unknown role", () => {
        const result = userAdminCreateSchema.safeParse({
            firstName: "Ada",
            lastName: "Lovelace",
            email: "ada@b.com",
            role: "SUPERADMIN",
        });
        expect(result.success).toBe(false);
    });
});

describe("courseSchema", () => {
    it("accepts a valid course payload", () => {
        const result = courseSchema.safeParse({
            code: "SWE401",
            title: "Software Engineering",
            description: "A course about building software",
            semester: "First",
            level: 400,
            unit: 3,
        });
        expect(result.success).toBe(true);
    });

    it("rejects a level outside 100-500", () => {
        const result = courseSchema.safeParse({
            code: "SWE401",
            title: "Software Engineering",
            description: "A course about building software",
            semester: "First",
            level: 600,
            unit: 3,
        });
        expect(result.success).toBe(false);
    });
});

describe("moduleSchema", () => {
    it("requires order >= 1", () => {
        expect(moduleSchema.safeParse({ title: "Intro", order: 0 }).success).toBe(false);
        expect(moduleSchema.safeParse({ title: "Intro", order: 1 }).success).toBe(true);
    });
});

describe("assessmentSchema", () => {
    it("requires a valid assessment type", () => {
        const base = {
            title: "Midterm",
            totalMarks: 100,
            passMark: 40,
            duration: 60,
            dueDate: null,
        };
        expect(assessmentSchema.safeParse({ ...base, type: "QUIZ" }).success).toBe(true);
        expect(assessmentSchema.safeParse({ ...base, type: "POP_QUIZ" }).success).toBe(false);
    });
});
