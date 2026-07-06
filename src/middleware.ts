import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rate limit all API routes (including public ones like /api/auth) by IP+route.
    if (pathname.startsWith("/api")) {
        const rateLimitKey = `${getClientIp(request)}:${pathname}`;
        const { allowed, limit, remaining, resetAt } = checkRateLimit(rateLimitKey);
        if (!allowed) {
            return new NextResponse(
                JSON.stringify({ success: false, error: "Too many requests" }),
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        "X-RateLimit-Limit": String(limit),
                        "X-RateLimit-Remaining": String(remaining),
                        "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
                    },
                }
            );
        }
    }

    // NextAuth's own endpoints (session, csrf, callback, signout, etc.) must always be
    // reachable regardless of auth state — redirecting them away breaks session polling
    // for already-logged-in users (SessionProvider calls GET /api/auth/session on every
    // page and periodically; redirecting it to an HTML page breaks its JSON parsing).
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    const session = await auth();

    // Public pages — no auth required
    const isPublicPath =
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password");

    // Already logged in, trying to access login/register → redirect to dashboard
    if (isPublicPath && session) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Public paths — let through
    if (isPublicPath) {
        return NextResponse.next();
    }

    // Not logged in — block
    if (!session) {
        if (pathname.startsWith("/api")) {
            return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(redirectUrl);
    }

    const role = session.user?.role as string | undefined;

    // Admin-only API routes. /api/settings is intentionally excluded — it's
    // self-service (notification preferences, password change) for any
    // logged-in user; each route there checks its own session, not role.
    if (pathname.startsWith("/api/users")) {
        if (role !== "ADMIN") {
            return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }
    }

    // Admin-only pages
    if (pathname.startsWith("/dashboard/users")) {
        if (role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
