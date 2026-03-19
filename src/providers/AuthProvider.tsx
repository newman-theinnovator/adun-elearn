"use client";
import { SessionProvider, useSession } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}

export const useAuth = () => {
    const session = useSession(); // or import { useSession } from "next-auth/react" if you want
    return session;
};