import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
    const session = await auth()
    const { pathname } = request.nextUrl

    // Public paths — no auth required
    const isPublicPath =
        pathname.startsWith('/login') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/api/auth')

    // Already logged in, trying to access login/register → redirect to dashboard
    if (isPublicPath && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Public paths — let through
    if (isPublicPath) {
        return NextResponse.next()
    }

    // Not logged in — block
    if (!session) {
        if (pathname.startsWith('/api')) {
            return new NextResponse(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            )
        }
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(redirectUrl)
    }

    const role = session.user?.role as string | undefined

    // Admin-only API routes
    if (pathname.startsWith('/api/users') || pathname.startsWith('/api/settings')) {
        if (role !== 'ADMIN') {
            return new NextResponse(
                JSON.stringify({ error: 'Forbidden' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            )
        }
    }

    // Admin-only pages
    if (pathname.startsWith('/dashboard/users')) {
        if (role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}