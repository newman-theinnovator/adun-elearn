import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardLayoutClient } from "@/components/layout/DashboardLayoutClient";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Type assertion for NextAuth session injection
    const user = {
        id: session.user.id || "",
        role: (session.user.role as string) || "STUDENT",
        firstName: (session.user as any).firstName || "Demo",
        lastName: (session.user as any).lastName || "User",
        email: session.user.email || "",
    };

    return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>;
}
