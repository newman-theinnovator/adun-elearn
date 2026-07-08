import NextAuth, { type NextAuthConfig } from "next-auth";

// Edge-safe auth config: no Prisma, no bcrypt, no providers. Next.js
// middleware always runs on the Edge runtime, where the standard Prisma
// Client can't run — importing it here (even transitively) breaks every
// request through middleware with a JWTSessionError, which middleware then
// silently treats as "not logged in". Middleware only needs to read the
// already-issued JWT's claims (role, id) for route-gating, so this config
// exists purely to give it an Edge-safe `auth()`. The full config in
// `auth.ts` (Node.js runtime — API routes, server components) extends this
// with the Credentials provider and the DB-backed session revalidation that
// actually needs Prisma.
export const authConfig: NextAuthConfig = {
    session: { strategy: "jwt" },
    providers: [],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.firstName = token.firstName as string;
                session.user.lastName = token.lastName as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};

// Edge-safe auth() for middleware only — does not perform the DB
// re-validation, so route-gating still works, but a just-deactivated
// account won't be booted out until it hits a real (Node.js runtime) API
// route, which uses the full auth() from `auth.ts` instead.
export const { auth: edgeAuth } = NextAuth(authConfig);
