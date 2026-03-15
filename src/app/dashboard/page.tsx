import { auth } from "@/lib/auth";
import { StudentDashboard } from "./components/StudentDashboard";
import { LecturerDashboard } from "./components/LecturerDashboard";
import { AdminDashboard } from "./components/AdminDashboard";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        return null; // Handled by middleware / layout redirect
    }

    const role = session.user.role;

    return (
        <>
            {role === "STUDENT" && <StudentDashboard />}
            {role === "LECTURER" && <LecturerDashboard />}
            {role === "ADMIN" && <AdminDashboard />}
        </>
    );
}
