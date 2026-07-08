import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

// Full config — Node.js runtime only (API routes, server components). Extends
// the Edge-safe authConfig with the Credentials provider and a jwt callback
// that re-validates against the DB. Never import this from middleware.ts.
export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (
                    !user ||
                    !(await bcrypt.compare(credentials.password as string, user.password))
                ) {
                    throw new Error("Invalid credentials");
                }

                if (!user.isActive) {
                    throw new Error("Account is disabled");
                }

                return {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token.id = user.id;
                token.validatedAt = Date.now();
                return token;
            }

            // JWT sessions are stateless, so a deactivated (or role-changed)
            // account would otherwise stay fully logged in on every device
            // until the token naturally expires. Re-check the DB periodically
            // — not on every single request, since middleware calls auth()
            // on nearly every page/API call — so a deactivation takes effect
            // within about a minute instead of only blocking future logins.
            const lastValidated = (token.validatedAt as number | undefined) ?? 0;
            if (Date.now() - lastValidated > 60_000) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { isActive: true, role: true, firstName: true, lastName: true },
                });
                if (!dbUser || !dbUser.isActive) {
                    return null;
                }
                token.role = dbUser.role;
                token.firstName = dbUser.firstName;
                token.lastName = dbUser.lastName;
                token.validatedAt = Date.now();
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
});
