import { describe, expect, it } from "vitest";
import * as z from "zod";
import {
    apiSuccess,
    apiError,
    unauthorized,
    forbidden,
    notFound,
    validationError,
} from "./api-response";

describe("apiSuccess", () => {
    it("returns the data unwrapped with a 200 by default", async () => {
        const res = apiSuccess({ id: 1 });
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ id: 1 });
    });

    it("respects a custom status", async () => {
        const res = apiSuccess({ id: 1 }, 201);
        expect(res.status).toBe(201);
    });
});

describe("apiError", () => {
    it("returns a message-only body when no errors are given", async () => {
        const res = apiError(400, "Bad request");
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ message: "Bad request" });
    });

    it("includes errors when provided", async () => {
        const res = apiError(400, "Bad request", [{ field: "x" }]);
        expect(await res.json()).toEqual({ message: "Bad request", errors: [{ field: "x" }] });
    });
});

describe("shorthand helpers", () => {
    it("unauthorized defaults to 401", async () => {
        const res = unauthorized();
        expect(res.status).toBe(401);
        expect(await res.json()).toEqual({ message: "Unauthorized" });
    });

    it("forbidden defaults to 403", async () => {
        const res = forbidden();
        expect(res.status).toBe(403);
    });

    it("notFound defaults to 404", async () => {
        const res = notFound();
        expect(res.status).toBe(404);
    });
});

describe("validationError", () => {
    it("returns a 400 with zod issues as errors", async () => {
        const schema = z.object({ email: z.string().email() });
        const result = schema.safeParse({ email: "not-an-email" });
        if (result.success) throw new Error("expected failure");

        const res = validationError(result.error);
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.message).toBe("Validation error");
        expect(Array.isArray(body.errors)).toBe(true);
    });
});
