import { NextResponse } from "next/server";
import * as z from "zod";

/**
 * Success responses are returned unwrapped (just the data) to match the
 * existing frontend contract — hooks under src/hooks call `res.json()` and use
 * the result directly, so wrapping this in an envelope would be a breaking change.
 */
export function apiSuccess<T>(data: T, status = 200) {
    return NextResponse.json(data, { status });
}

/**
 * Error responses always include `message` (existing frontend code reads
 * `error.message`) plus an optional `errors` array for validation details —
 * matching the shape already used by src/app/api/courses/route.ts.
 */
export function apiError(status: number, message: string, errors?: unknown) {
    return NextResponse.json({ message, ...(errors !== undefined ? { errors } : {}) }, { status });
}

export function unauthorized(message = "Unauthorized") {
    return apiError(401, message);
}

export function forbidden(message = "Forbidden") {
    return apiError(403, message);
}

export function notFound(message = "Not found") {
    return apiError(404, message);
}

export function validationError(error: z.ZodError) {
    return apiError(400, "Validation error", error.issues);
}

/**
 * Runs a route handler and converts thrown ZodErrors / generic errors into the
 * standard error response shape, logging unexpected errors server-side.
 */
export async function withApiErrorHandling(
    handler: () => Promise<NextResponse>
): Promise<NextResponse> {
    try {
        return await handler();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return validationError(error);
        }
        console.error("Unhandled API error:", error);
        return apiError(500, "Internal server error");
    }
}
