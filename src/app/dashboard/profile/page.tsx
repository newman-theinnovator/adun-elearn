"use client";

import { useAuth } from "@/providers/AuthProvider";
import { User, Mail, BookOpen, Calendar, Shield, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
    const { data: session, status } = useAuth();
    const user = session?.user as any;

    if (status === "loading" || !user) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-48 w-full rounded-2xl" />
                <div className="grid sm:grid-cols-2 gap-4">
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    // Define role coloration logic dynamically based on normalized DB roles
    const roleColor = user.role === "STUDENT"
        ? "bg-emerald-500"
        : user.role === "LECTURER"
            ? "bg-blue-500"
            : "bg-purple-500";

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold dark:text-white">My Profile</h1>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden animate-fade-in-up">
                <div className="h-32 bg-gradient-to-r from-blue-900 to-indigo-800 relative">
                    <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.2)_100%)]" />
                </div>
                <div className="px-6 pb-6 -mt-12">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left relative z-10">
                        <div className={`w-28 h-28 ${roleColor} rounded-2xl flex items-center justify-center text-white text-3xl font-black border-4 border-white dark:border-gray-800 shadow-xl`}>
                            {user.firstName?.[0] || ""}{user.lastName?.[0] || "U"}
                        </div>
                        <div className="pb-1 text-center sm:text-left flex-1 mt-2 sm:mt-0">
                            <h2 className="text-2xl font-bold dark:text-white">{user.firstName} {user.lastName}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mt-1">
                                {user.role} <span className="text-gray-300 dark:text-gray-600 px-2">•</span> {user.department?.name || "General Department"}
                            </p>
                        </div>
                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-blue-800 transition-all mt-4 sm:mt-0">
                            <Edit className="w-4 h-4" /> Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 animate-fade-in-up">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg mb-5 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3"><User className="w-5 h-5 text-blue-500" /> Personal Details</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600/50">
                            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Email Address</p>
                                <p className="text-sm font-semibold dark:text-gray-200 truncate">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600/50">
                            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                <Shield className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{user.role === "STUDENT" ? "Matric Number" : "Staff ID"}</p>
                                <p className="text-sm font-semibold dark:text-gray-200">{user.matricNumber || user.staffId || "Not assigned"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600/50">
                            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                <BookOpen className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Department</p>
                                <p className="text-sm font-semibold dark:text-gray-200">{user.department?.name || "General Department"}</p>
                            </div>
                        </div>

                        {user.level && (
                            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600/50">
                                <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                    <span className="text-gray-400 dark:text-gray-500 font-black text-sm">{user.level[0]}L</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Academic Level</p>
                                    <p className="text-sm font-semibold dark:text-gray-200">{user.level} Level</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600/50">
                            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Joined Date</p>
                                <p className="text-sm font-semibold dark:text-gray-200">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "long" }) : "Recently"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg mb-5 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">⚙️ Account Settings</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-100 dark:border-gray-700 transition-all hover:border-gray-300 dark:hover:border-gray-500 group">
                            <p className="font-bold text-sm dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Change Password</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Update your account authentication credentials</p>
                        </button>
                        <button className="w-full text-left p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-100 dark:border-gray-700 transition-all hover:border-gray-300 dark:hover:border-gray-500 group">
                            <p className="font-bold text-sm dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Notification Preferences</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage email and in-app alert frequencies</p>
                        </button>
                        <button className="w-full text-left p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-100 dark:border-gray-700 transition-all hover:border-gray-300 dark:hover:border-gray-500 group">
                            <p className="font-bold text-sm dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Privacy & Security</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Review active sessions and visibility controls</p>
                        </button>
                        <button className="w-full text-left p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-100 dark:border-gray-700 transition-all hover:border-gray-300 dark:hover:border-gray-500 group">
                            <p className="font-bold text-sm dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Download Directory</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Export all your academic transcripts and data</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
