import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
    const session = await auth()
    const { pathname } = request.nextUrl

    // Public paths that do NOT require authentication
    const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password')

    // If user is accessing auth routes but is already logged in, redirect to dashboard
    if (isAuthPath) {
        if (session) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return NextResponse.next()
    }

    // Allow unrestricted access to specific API routes
    if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/analytics')) {
        return NextResponse.next()
    }

    // All other routes require authentication
    if (!session) {
        let from = request.nextUrl.pathname;
        if (request.nextUrl.search) {
            from += request.nextUrl.search;
        }
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('callbackUrl', from)

        // If it's an API route and unauthorized, return 401 instead of redirecting
        if (pathname.startsWith('/api')) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        return NextResponse.redirect(redirectUrl)
    }

    // Role-based route protection
    const role = session.user?.role as string | undefined

    if (pathname.startsWith('/users') || pathname.startsWith('/settings')) {
        if (role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    if (pathname.startsWith('/api/users')) {
        if (role !== 'ADMIN') {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            })
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
