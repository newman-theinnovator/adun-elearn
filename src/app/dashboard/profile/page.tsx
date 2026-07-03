"use client";

import { useAuth } from "@/providers/AuthProvider";
import { User, Mail, BookOpen, Calendar, Shield, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
    const { data: session, status } = useAuth();
    const user = session?.user as any;

    if (status === "loading" || !user) {
        return (
            <div className="mx-auto max-w-3xl space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-48 w-full rounded-2xl" />
                <div className="grid gap-4 sm:grid-cols-2">
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    // Define role coloration logic dynamically based on normalized DB roles
    const roleColor =
        user.role === "STUDENT"
            ? "bg-emerald-500"
            : user.role === "LECTURER"
              ? "bg-blue-500"
              : "bg-purple-500";

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-2xl font-bold dark:text-white">My Profile</h1>

            <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="relative h-32 bg-gradient-to-r from-blue-900 to-indigo-800">
                    <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.2)_100%)]" />
                </div>
                <div className="-mt-12 px-6 pb-6">
                    <div className="relative z-10 flex flex-col items-center gap-5 text-center sm:flex-row sm:items-end sm:text-left">
                        <div
                            className={`h-28 w-28 ${roleColor} flex items-center justify-center rounded-2xl border-4 border-white text-3xl font-black text-white shadow-xl dark:border-gray-800`}
                        >
                            {user.firstName?.[0] || ""}
                            {user.lastName?.[0] || "U"}
                        </div>
                        <div className="mt-2 flex-1 pb-1 text-center sm:mt-0 sm:text-left">
                            <h2 className="text-2xl font-bold dark:text-white">
                                {user.firstName} {user.lastName}
                            </h2>
                            <p className="mt-1 text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                {user.role}{" "}
                                <span className="px-2 text-gray-300 dark:text-gray-600">•</span>{" "}
                                {user.department?.name || "General Department"}
                            </p>
                        </div>
                        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg sm:mt-0 sm:w-auto">
                            <Edit className="h-4 w-4" /> Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            <div className="animate-fade-in-up grid gap-5 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-3 text-lg font-bold dark:border-gray-700 dark:text-white">
                        <User className="h-5 w-5 text-blue-500" /> Personal Details
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-600/50 dark:bg-gray-700/50">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
                                <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                    Email Address
                                </p>
                                <p className="truncate text-sm font-semibold dark:text-gray-200">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-600/50 dark:bg-gray-700/50">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
                                <Shield className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                    {user.role === "STUDENT" ? "Matric Number" : "Staff ID"}
                                </p>
                                <p className="text-sm font-semibold dark:text-gray-200">
                                    {user.matricNumber || user.staffId || "Not assigned"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-600/50 dark:bg-gray-700/50">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
                                <BookOpen className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                    Department
                                </p>
                                <p className="text-sm font-semibold dark:text-gray-200">
                                    {user.department?.name || "General Department"}
                                </p>
                            </div>
                        </div>

                        {user.level && (
                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-600/50 dark:bg-gray-700/50">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
                                    <span className="text-sm font-black text-gray-400 dark:text-gray-500">
                                        {user.level[0]}L
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                        Academic Level
                                    </p>
                                    <p className="text-sm font-semibold dark:text-gray-200">
                                        {user.level} Level
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-600/50 dark:bg-gray-700/50">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
                                <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                    Joined Date
                                </p>
                                <p className="text-sm font-semibold dark:text-gray-200">
                                    {user.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString("en-NG", {
                                              year: "numeric",
                                              month: "long",
                                          })
                                        : "Recently"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-3 text-lg font-bold dark:border-gray-700 dark:text-white">
                        ⚙️ Account Settings
                    </h3>
                    <div className="space-y-3">
                        <button className="group w-full rounded-xl border border-gray-100 p-4 text-left transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-700/50">
                            <p className="text-sm font-bold transition-colors group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400">
                                Change Password
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Update your account authentication credentials
                            </p>
                        </button>
                        <button className="group w-full rounded-xl border border-gray-100 p-4 text-left transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-700/50">
                            <p className="text-sm font-bold transition-colors group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400">
                                Notification Preferences
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Manage email and in-app alert frequencies
                            </p>
                        </button>
                        <button className="group w-full rounded-xl border border-gray-100 p-4 text-left transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-700/50">
                            <p className="text-sm font-bold transition-colors group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400">
                                Privacy & Security
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Review active sessions and visibility controls
                            </p>
                        </button>
                        <button className="group w-full rounded-xl border border-gray-100 p-4 text-left transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-700/50">
                            <p className="text-sm font-bold transition-colors group-hover:text-blue-600 dark:text-gray-200 dark:group-hover:text-blue-400">
                                Download Directory
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Export all your academic transcripts and data
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
